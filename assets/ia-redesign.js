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
  const target = {'#practice': 'apps', '#visit-takeaway': 'question'}[link?.getAttribute('href')];
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

if (location.hash) restoreRoute();
