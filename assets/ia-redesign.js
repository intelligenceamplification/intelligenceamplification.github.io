const chapterButtons = [...document.querySelectorAll('[data-chapter]')];
const chapters = [...document.querySelectorAll('[data-book-chapter]')];
let chapterIndex = 0;

function showChapter(index, updateUrl = true) {
  chapterIndex = index;
  if (updateUrl) writeRoute('chapter-' + chapters[index].dataset.bookChapter);
  for (const [position, chapter] of chapters.entries()) chapter.hidden = position !== index;
  pick('book-contents').hidden = true;
  pick('book-reading').hidden = false;
  pick('chapter-previous').hidden = index === 0;
  pick('chapter-next').hidden = index === chapters.length - 1;
  chapters[index].querySelector('h2').focus({preventScroll: true});
  window.scrollTo(0, 0);
}
for (const [index, button] of chapterButtons.entries()) button.addEventListener('click', () => showChapter(index));
bind('chapter-previous', () => showChapter(chapterIndex - 1));
bind('chapter-next', () => showChapter(chapterIndex + 1));
function resetBook() {
  pick('book-reading').hidden = true;
  pick('book-contents').hidden = false;
  chapters[chapterIndex].hidden = true;
}
bind('chapter-contents', () => {
  writeRoute('book');
  resetBook();
  chapterButtons[chapterIndex].focus();
});

for (const list of document.querySelectorAll('.reading-list')) {
  list.addEventListener('toggle', event => {
    const current = event.target;
    if (current.parentElement !== list || !current.open) return;
    for (const entry of list.querySelectorAll(':scope > details[open]')) {
      if (entry !== current) entry.open = false;
    }
  }, true);
}

pick('capability-explorer').addEventListener('click', event => {
  const link = event.target.closest('a');
  const target = {'#practice': 'apps', '#visit-takeaway': 'experiences'}[link?.getAttribute('href')];
  if (!target) return;
  event.preventDefault();
  show(target);
});

let breathTimer;
function stopBreath(message = 'Ready when you are.') {
  clearTimeout(breathTimer);
  delete pick('breath-circle').dataset.phase;
  pick('breath-count').textContent = '';
  pick('breath-status').textContent = message;
  pick('breath-start').disabled = false;
  pick('breath-stop').hidden = true;
}
bind('breath-start', () => {
  const circle = pick('breath-circle');
  const status = pick('breath-status');
  pick('breath-stop').hidden = false;
  pick('breath-stop').focus();
  pick('breath-start').disabled = true;
  const started = performance.now();
  function tick() {
    const elapsed = performance.now() - started;
    if (elapsed >= 12000) {
      const returnFocus = document.activeElement === pick('breath-stop');
      stopBreath('Round complete.');
      if (returnFocus) pick('breath-start').focus();
      return;
    }
    const phase = elapsed < 4000 ? 'in' : 'out';
    if (circle.dataset.phase !== phase) {
      circle.dataset.phase = phase;
      status.textContent = phase === 'in' ? 'Breathe in' : 'Breathe out';
    }
    const phaseEnd = phase === 'in' ? 4000 : 12000;
    pick('breath-count').textContent = String(Math.ceil((phaseEnd - elapsed) / 1000));
    breathTimer = setTimeout(tick, 1000 - elapsed % 1000);
  }
  tick();
});
bind('breath-stop', () => {
  stopBreath();
  pick('breath-start').focus();
});

const caseResponses = {
  'case-chronology': [
    'P-01 gives a date for a proposed remedy. It does not establish a delivery deadline.',
    'That distinction matters. The March 10 date was a request, and the only reference to a promise is an undated staff note.'
  ],
  'case-referrals': [
    'R-03 names no owner. Assigning one here would turn an assumption into a task assignment.',
    'The queue now accounts for every pending referral. R-03 stays visible with its owner and deadline marked for confirmation.'
  ]
};
for (const example of document.querySelectorAll('.example-case')) {
  const run = example.querySelector('.case-run');
  const trace = example.querySelector('.case-run-result');
  const review = example.querySelector('.case-review');
  const decision = example.querySelector('.case-choices');
  run.addEventListener('click', () => {
    trace.hidden = false;
    run.setAttribute('aria-expanded', 'true');
    run.hidden = true;
    trace.querySelector('h2').focus();
  });
  review.addEventListener('click', () => {
    decision.hidden = false;
    review.setAttribute('aria-expanded', 'true');
    review.hidden = true;
    decision.querySelector('legend').focus();
  });
  const result = example.querySelector('.case-result');
  const status = example.querySelector('.case-status');
  const choices = example.querySelectorAll('[data-case-choice]');
  for (const button of choices) {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const revised = button.dataset.caseChoice === 'revise';
      for (const choice of choices) choice.setAttribute('aria-pressed', String(choice === button));
      status.textContent = caseResponses[example.id][Number(revised)];
      result.hidden = !revised;
      if (revised) result.querySelector('h2').focus();
      else example.querySelector('.case-source').open = true;
    });
  }
  example.querySelector('.case-download').addEventListener('click', () => {
    const title = example.querySelector('h1').textContent;
    const entries = [...result.querySelectorAll('section')].map(section =>
      section.querySelector('h2').textContent + ': ' + section.querySelector('p').textContent
    );
    const job = example.querySelector('.case-brief p').textContent;
    const actions = [...example.querySelectorAll('.case-trace li')].map(item => item.textContent);
    const notes = document.createElement('pre');
    notes.textContent = [title, 'Guided simulation · Intelligence Amplification',
      'Assigned work\n' + job, 'Agent’s work\n' + actions.join('\n'),
      'Review decision\n' + status.textContent, 'Final artifact\n' + entries.join('\n\n')].join('\n\n');
    const artifact = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Experience record</title>' +
      '<style>body{max-width:42rem;margin:3rem auto;padding:0 1rem;font:1.1rem/1.55 Georgia,serif;color:#161c24}pre{font:inherit;white-space:pre-wrap}</style>' +
      notes.outerHTML + '</html>';
    downloadPage(artifact, example.id + '.html');
  });
}

if (location.hash) restoreRoute();
