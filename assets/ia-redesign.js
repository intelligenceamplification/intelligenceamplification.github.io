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

let breathPhase;
let breathEnd;
function stopBreath(message = 'Ready when you are.') {
  clearTimeout(breathPhase);
  clearTimeout(breathEnd);
  delete pick('breath-circle').dataset.phase;
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
  circle.dataset.phase = 'in';
  status.textContent = 'Breathe in';
  breathPhase = setTimeout(() => {
    circle.dataset.phase = 'out';
    status.textContent = 'Breathe out';
  }, 4000);
  breathEnd = setTimeout(() => {
    const returnFocus = document.activeElement === pick('breath-stop');
    stopBreath('Round complete.');
    if (returnFocus) pick('breath-start').focus();
  }, 12000);
});
bind('breath-stop', () => {
  stopBreath();
  pick('breath-start').focus();
});

if (location.hash) restoreRoute();
