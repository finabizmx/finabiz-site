#!/usr/bin/env python3
"""Check the static Pages site and optionally print a Markdown inventory."""
import argparse
from datetime import date
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urljoin, urlsplit
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://finabiz.mx"
SITEMAP = "https://finabiz.mx/sitemap.xml"
SHARED_TAG = "assets/analytics.js"
LEGACY_REDIRECT = "contabilidad-y-cumplimiento-fiscal.html"
EXPECTED_UNINDEXED = {
    "404.html", "agenda.html", "asesoria-fiscal-estrategica.html",
    LEGACY_REDIRECT, "detective/index.html", "regimenes-0ac8028bfa17.html",
}
TAGGED_EXCLUSIONS = {"404.html", "agenda.html", "asesoria-fiscal-estrategica.html"}
EXCLUDED_PRODUCTS = re.compile(r"(?:^|/)(?:detective(?:-ecommerce)?|ruta-?7d|finabiz-academy|academy)(?:[./-]|$)", re.I)
SECRET_PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:ENCRYPTED |RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "GitHub token": re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b"),
    "AWS key": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "Stripe secret": re.compile(r"\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b"),
    "Google OAuth secret": re.compile(r"\bGOCSPX-[A-Za-z0-9_-]{16,}\b"),
}


def route_of(path):
    if path == "index.html" or path.endswith("/index.html"):
        path = path.removesuffix("index.html")
    return SITE + "/" + path


class Document(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.anchors = set()
        self.links = []
        self.canonical = []
        self.title = []
        self.headings = []
        self.meta = {}
        self.schemas = []
        self.tags = []
        self.refresh = None
        self.active = None
        self.feed((ROOT / path).read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        line = self.getpos()[0]
        if attrs.get("id"):
            self.anchors.add(attrs["id"])
        if tag == "a" and attrs.get("name"):
            self.anchors.add(attrs["name"])
        if tag in ("title", "h1"):
            self.active = (tag, line, [])
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.active = (tag, line, [])
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append((attrs.get("href", ""), line))
        if tag == "meta":
            name = attrs.get("name") or attrs.get("property")
            if name:
                self.meta[name.lower()] = attrs.get("content", "")
            if attrs.get("http-equiv", "").lower() == "refresh":
                self.refresh = (attrs.get("content", ""), line)
        if tag == "script" and attrs.get("src") == SHARED_TAG:
            self.tags.append(line)
        for key in ("href", "src", "poster"):
            if attrs.get(key):
                self.links.append((tag, attrs[key], line))

    def handle_data(self, data):
        if self.active:
            self.active[2].append(data)

    def handle_endtag(self, tag):
        if self.active and tag == self.active[0]:
            _, line, chunks = self.active
            value = "".join(chunks).strip()
            values = {"title": self.title, "h1": self.headings, "script": self.schemas}
            values[tag].append((value, line))
            self.active = None


def local_path(url):
    path = unquote(url.path).lstrip("/")
    if not path or path.endswith("/"):
        path += "index.html"
    return path


def schema_nodes(schema):
    if isinstance(schema, list):
        for item in schema:
            yield from schema_nodes(item)
    elif isinstance(schema, dict):
        if "@type" in schema:
            yield schema
        yield from schema_nodes(schema.get("@graph", []))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--markdown", action="store_true", help="print indexed and excluded pages")
    args = parser.parse_args()
    errors = []
    files = sorted(path for path in ROOT.rglob("*.html")
                   if all(not part.startswith(".") and part != "node_modules" for part in path.relative_to(ROOT).parts))
    docs = {path.relative_to(ROOT).as_posix(): Document(path.relative_to(ROOT).as_posix()) for path in files}
    if f"Sitemap: {SITEMAP}" not in (ROOT / "robots.txt").read_text():
        errors.append("robots.txt does not reference the canonical sitemap")
    sitemap = ElementTree.parse(ROOT / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    entries = {}
    for item in sitemap.findall("s:url", ns):
        loc = item.findtext("s:loc", "", ns)
        date_value = item.findtext("s:lastmod", "", ns)
        parsed = urlsplit(loc)
        path = local_path(parsed)
        if loc != route_of(path) or path not in docs or path in entries:
            errors.append(f"sitemap.xml duplicate, noncanonical or missing URL: {loc}")
        entries[path] = date_value
        if date_value:
            try:
                date.fromisoformat(date_value[:10])
            except ValueError:
                errors.append(f"sitemap.xml invalid lastmod: {loc}")
    if set(docs) - set(entries) != EXPECTED_UNINDEXED:
        errors.append("The set of pages outside the sitemap changed")

    if args.markdown:
        print("| Archivo | Canonical (línea) | Title / H1 (líneas) | JSON-LD | GA (línea) | Sitemap lastmod |")
        print("|---|---|---|---|---|---|")
    indexed_titles = set()
    expected_schema = {
        "cumplimiento-optimizacion-fiscal.html": "Service",
        "calculadora-iva-resico.html": "WebApplication",
    }
    for path, doc in docs.items():
        canonical = doc.canonical[0][0] if len(doc.canonical) == 1 else ""
        robots = doc.meta.get("robots", "")
        if len(doc.title) != 1 or not doc.title[0][0] or len(doc.headings) != (0 if path == "detective/index.html" else 1):
            errors.append(f"{path} malformed title or unexpected H1 count")
        if path in entries:
            if canonical != route_of(path) or "noindex" in robots or not doc.meta.get("description"):
                errors.append(f"{path} invalid canonical, robots or description")
            if doc.title:
                title = doc.title[0][0].casefold()
                if title in indexed_titles:
                    errors.append(f"{path} duplicate title among indexable pages")
                indexed_titles.add(title)
        elif "noindex" not in robots:
            errors.append(f"{path} unexpected indexing directive")
        should_measure = path in entries or path in TAGGED_EXCLUSIONS
        if len(doc.tags) != int(should_measure):
            errors.append(f"{path} incorrect analytics bootstrap count")
        if path == LEGACY_REDIRECT:
            target = SITE + "/cumplimiento-optimizacion-fiscal.html"
            if canonical != target or not doc.refresh or not re.search(r"0;\s*url=/cumplimiento-optimizacion-fiscal\.html$", doc.refresh[0], re.I):
                errors.append(f"{path} incorrect redirect target or canonical")

        types = []
        for payload, line in doc.schemas:
            try:
                parsed = json.loads(payload)
                for node in schema_nodes(parsed):
                    types.extend(node["@type"] if isinstance(node["@type"], list) else [node["@type"]])
                    modified = node.get("dateModified")
                    published = node.get("datePublished")
                    if modified and published and modified[:10] < published[:10]:
                        errors.append(f"{path}:{line} dateModified precedes datePublished")
            except (ValueError, TypeError):
                errors.append(f"{path}:{line} invalid JSON-LD")
        if path in expected_schema:
            card_valid = (doc.meta.get("og:url") == canonical
                          and doc.meta.get("twitter:card") == "summary_large_image"
                          and all(doc.meta.get(key) for key in ("og:title", "og:description", "og:image", "twitter:image")))
            if not card_valid or not {expected_schema[path], "BreadcrumbList"}.issubset(types):
                errors.append(f"{path} incomplete social metadata or structured data")
        for tag, href, line in doc.links:
            if tag == "a" and href.startswith("#") and not href[1:]:
                continue
            try:
                url = urlsplit(urljoin(route_of(path), href))
            except ValueError:
                errors.append(f"{path}:{line} invalid URL")
                continue
            if url.scheme not in ("https", "http") or url.hostname not in ("www.finabiz.mx", "finabiz.mx"):
                continue
            target = local_path(url)
            if not (ROOT / target).is_file():
                errors.append(f"{path}:{line} missing target {url.path}")
            if url.fragment and target in docs and unquote(url.fragment) not in docs[target].anchors:
                errors.append(f"{path}:{line} missing fragment in {url.path}")
            if path != "detective/index.html" and tag == "a" and EXCLUDED_PRODUCTS.search(url.path):
                errors.append(f"{path}:{line} corporate link to an excluded product")

        if args.markdown:
            canonical_cell = doc.canonical[0][1] if canonical else "—"
            title_line = doc.title[0][1] if doc.title else "—"
            h1_line = doc.headings[0][1] if doc.headings else "—"
            print(f"| `{path}` | {canonical_cell} | {title_line} / {h1_line} | {', '.join(types) or '—'} | {doc.tags[0] if doc.tags else '—'} | {entries.get(path) or ('—' if path in entries else 'noindex')} |")

    for file in (ROOT / "assets").iterdir():
        if file.suffix != ".css":
            continue
        contents = file.read_text(encoding="utf-8")
        for match in re.finditer(r"""url\(["']?([^)'"]+)["']?\)""", contents):
            if unquote(match[1]).strip().startswith("#"):
                continue
            parsed = urlsplit(urljoin(SITE + "/assets/" + file.name, match[1]))
            if parsed.scheme in ("https", "http") and parsed.hostname == "finabiz.mx" and not (ROOT / local_path(parsed)).is_file():
                errors.append(f"{file.relative_to(ROOT)} missing CSS asset {parsed.path}")

    published_text = {".css", ".html", ".js", ".json", ".mjs", ".svg", ".txt", ".xml"}
    published_directories = (ROOT, ROOT / "assets", ROOT / "detective")
    sources = {path for directory in published_directories for path in directory.iterdir()
               if path.is_file() and path.suffix in published_text} | {ROOT / path for path in docs}
    for file in sorted(sources):
        text = file.read_text(encoding="utf-8")
        for kind, pattern in SECRET_PATTERNS.items():
            match = pattern.search(text)
            if match:
                errors.append(f"{file.relative_to(ROOT)}:{text.count(chr(10), 0, match.start()) + 1} possible {kind}; value withheld")

    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    if not args.markdown:
        print(f"{len(docs)} HTML, {len(entries)} URLs en sitemap. Validación estática correcta.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
