const progress = document.querySelector('.reading-progress span');
function updateProgress() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${available > 0 ? window.scrollY / available : 0})`;
}
updateProgress();
window.addEventListener('scroll', updateProgress, { passive: true });
