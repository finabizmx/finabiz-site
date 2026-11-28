// Autodiagnóstico interactivo de "10 señales": agrega una casilla a cada señal
// y muestra el resultado y la prioridad. Sin JavaScript, el artículo se lee igual.
(function () {
  var article = document.querySelector('.article-body');
  if (!article) return;
  var headings = Array.prototype.filter.call(article.querySelectorAll('h3'), function (h) {
    return /^\d+\.\s/.test(h.textContent.trim());
  });
  if (headings.length !== 10) return;

  var KEY = 'finabiz-autodiagnostico-10-senales';
  var saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { saved = []; }

  var priorities = [
    { signals: [4, 9], text: 'declaraciones omitidas y opinión de cumplimiento (señales 4 y 9)' },
    { signals: [5], text: 'tu buzón tributario (señal 5)' },
    { signals: [6, 7], text: 'facturas y conciliación de depósitos (señales 6 y 7)' },
    { signals: [1, 2], text: 'separar cuentas y conocer tu utilidad (señales 1 y 2)' },
    { signals: [3, 8, 10], text: 'régimen, colaboradores y proyección anual (señales 3, 8 y 10)' }
  ];

  var boxes = headings.map(function (h, i) {
    var n = i + 1;
    var label = document.createElement('label');
    label.className = 'senal-check';
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.value = String(n);
    input.checked = saved.indexOf(n) !== -1;
    input.setAttribute('aria-describedby', 'senal-titulo-' + n);
    h.id = h.id || 'senal-titulo-' + n;
    var span = document.createElement('span');
    span.textContent = 'Me pasa';
    label.appendChild(input);
    label.appendChild(span);
    h.parentNode.insertBefore(label, h.nextSibling);
    return input;
  });

  function scoreBox(id) {
    var box = document.createElement('div');
    box.className = 'senal-score';
    box.id = id;
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<p class="senal-score-k">Tu autodiagnóstico</p><p class="senal-score-v"></p><p class="senal-score-n"></p>';
    return box;
  }

  var top = scoreBox('senal-score-top');
  var howTo = document.getElementById('lectura-1');
  var list = howTo && howTo.nextElementSibling && howTo.nextElementSibling.nextElementSibling;
  if (list && list.tagName === 'UL') list.parentNode.insertBefore(top, list.nextSibling);
  var bottom = scoreBox('senal-score-bottom');
  bottom.removeAttribute('aria-live');
  bottom.removeAttribute('role');
  var firstSteps = document.getElementById('lectura-5');
  if (firstSteps) firstSteps.parentNode.insertBefore(bottom, firstSteps.nextSibling);

  function update() {
    var checked = boxes.filter(function (b) { return b.checked; }).map(function (b) { return Number(b.value); });
    try { localStorage.setItem(KEY, JSON.stringify(checked)); } catch (e) { /* sin almacenamiento */ }
    var n = checked.length;
    var tone, verdict, note;
    if (n === 0) {
      tone = 'neutral';
      verdict = 'Marca "Me pasa" en cada señal que te describa.';
      note = 'Tu resultado se actualiza al momento y solo se guarda en este navegador.';
    } else {
      var first = priorities.filter(function (p) {
        return p.signals.some(function (s) { return checked.indexOf(s) !== -1; });
      })[0];
      var start = ' Empieza por ' + first.text + '.';
      if (n <= 2) {
        tone = 'good';
        verdict = 'Marcaste ' + n + ' de 10: tu base está bien.';
        note = 'Atiende lo que marcaste antes de la declaración anual.' + start;
      } else if (n <= 5) {
        tone = 'warn';
        verdict = 'Marcaste ' + n + ' de 10: hay huecos que ya te cuestan dinero.';
        note = 'Conviene ordenarlos en las próximas semanas.' + start;
      } else {
        tone = 'bad';
        verdict = 'Marcaste ' + n + ' de 10: tu contabilidad necesita una revisión completa.';
        note = 'Hazla antes de presentar la anual.' + start;
      }
    }
    [top, bottom].forEach(function (box) {
      if (!box.parentNode) return;
      box.dataset.tone = tone;
      box.querySelector('.senal-score-v').textContent = verdict;
      box.querySelector('.senal-score-n').textContent = note;
    });
  }

  boxes.forEach(function (b) { b.addEventListener('change', update); });
  update();
})();
