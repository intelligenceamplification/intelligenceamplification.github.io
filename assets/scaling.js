// Shared parameter axes for the chronological model-table dot plot.
const tracks = document.querySelectorAll('.research-track');
function setScale(mode) {
 const log = mode === 'log';
 const ticks = log ? ['100M','1B','10B','100B','1T','10T','100T'] : ['0','2T','4T','6T','8T','10T','12T'];
 document.querySelectorAll('.research-axis span').forEach((span,i) => span.textContent = ticks[i]);
 document.querySelectorAll('.mobile-plot-axis').forEach(axis => {axis.children[0].textContent=ticks[0];axis.children[1].textContent=ticks[3];axis.children[2].textContent=ticks[6];});
 tracks.forEach(track => track.querySelectorAll('[data-value]').forEach(point => {
  const v = Number(point.dataset.value);
  point.style.left = (4 + (log ? (Math.log10(v)+1)/6 : v/12000)*92) + '%';
 }));
 document.querySelector('#axis-description').textContent = log ? 'Parameters · log₁₀ axis · 100 million to 100 trillion' : 'Parameters · linear axis · 0 to 12 trillion';
 document.querySelector('#chart-reading').textContent = (log ? 'Equal horizontal distances represent tenfold changes.' : 'Equal horizontal distances represent two trillion parameters. Early models cluster near zero; use the logarithmic view to distinguish them.') + ' No curve is fitted between models. M = million; B = billion; T = trillion.';
 document.querySelector('.research-axis').setAttribute('aria-label', (log ? 'Logarithmic' : 'Linear') + ' parameter axis');
 document.querySelectorAll('[data-scale]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scale === mode)));
}
document.querySelectorAll('[data-scale]').forEach(button => button.addEventListener('click', () => setScale(button.dataset.scale)));
