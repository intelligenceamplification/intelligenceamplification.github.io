/* Sky recordings and timings are generated together; the audio clock is authoritative. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const play = $('play'), restart = $('restart'), speed = $('speed');
  const seek = $('seek'), status = $('status'), follow = $('follow');
  const audio = new Audio();
  audio.preload = 'metadata';
  let words = [], spans = [], active = -1, frame = 0, pending = false;
  let duration = 0, ready = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clock = value => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;

  function mark(index) {
    if (index === active) return;
    if (active >= 0) spans[active].classList.remove('active');
    active = index;
    if (index < 0) return;
    const el = spans[index];
    el.classList.add('active');
    if (follow.checked && !audio.paused) {
      const rect = el.getBoundingClientRect();
      const controlsTop = document.querySelector('.reader').getBoundingClientRect().top;
      if (rect.top < 80 || rect.bottom > Math.min(innerHeight * 0.65, controlsTop - 24)) {
        el.scrollIntoView({ block: 'center', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      }
    }
  }

  function render() {
    const t = audio.currentTime || 0;
    seek.value = t;
    $('time').textContent = `${clock(t)} / ${clock(duration)}`;
    let low = 0, high = words.length - 1, index = -1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (words[mid].start <= t) { index = mid; low = mid + 1; }
      else high = mid - 1;
    }
    mark(index >= 0 && t < words[index].end && !audio.ended ? index : -1);
  }

  function tick() {
    render();
    if (!audio.paused && !audio.ended) frame = requestAnimationFrame(tick);
  }

  async function start() {
    if (!ready || pending) return;
    pending = true;
    play.disabled = true;
    try {
      if (audio.ended) audio.currentTime = 0;
      await audio.play();
    } catch (_) {
      status.textContent = 'Playback could not start. Tap Play to retry.';
    } finally {
      pending = false;
      play.disabled = !ready;
    }
  }

  play.addEventListener('click', () => audio.paused ? start() : audio.pause());
  restart.addEventListener('click', () => { audio.currentTime = 0; render(); start(); });
  speed.addEventListener('change', () => { audio.playbackRate = Number(speed.value); });
  seek.addEventListener('input', () => { audio.currentTime = Number(seek.value); render(); });
  audio.addEventListener('play', () => {
    play.textContent = 'Ⅱ Pause'; status.textContent = 'Playing';
    cancelAnimationFrame(frame); tick();
  });
  audio.addEventListener('pause', () => {
    cancelAnimationFrame(frame); render(); play.textContent = '▶ Resume';
    if (!audio.ended) status.textContent = 'Paused';
  });
  audio.addEventListener('ended', () => {
    cancelAnimationFrame(frame); render(); play.textContent = '▶ Replay'; status.textContent = 'Finished';
  });
  audio.addEventListener('timeupdate', render);
  audio.addEventListener('seeked', render);
  audio.addEventListener('waiting', () => { status.textContent = 'Buffering audio…'; });
  audio.addEventListener('playing', () => { status.textContent = 'Playing'; });
  audio.addEventListener('error', () => {
    ready = false;
    play.disabled = restart.disabled = seek.disabled = true;
    status.textContent = 'Audio recording could not load. Reload the page to retry.';
  });
  window.addEventListener('pagehide', () => audio.pause());

  async function load() {
    try {
      const response = await fetch('audio/issue-01.json');
      if (!response.ok) throw new Error('Missing Sky manifest');
      const data = await response.json();
      const blocks = [...document.querySelectorAll('#article h2, #article .readable')];
      if (data.voice !== 'af_sky' || data.alignment !== 'kokoro-model-durations' ||
          !Number.isFinite(data.duration) || data.duration <= 0 ||
          JSON.stringify(blocks.map(el => el.textContent)) !== JSON.stringify(data.blocks)) {
        throw new Error('Recording and text do not match');
      }
      const tokens = blocks.flatMap((el, block) => [...el.textContent.matchAll(/\S+/g)].map(m => ({text: m[0], block})));
      if (!Array.isArray(data.words) || data.words.length !== tokens.length || data.words.some((w, i) =>
        w.text !== tokens[i].text || w.block !== tokens[i].block ||
        !Number.isFinite(w.start) || !Number.isFinite(w.end) || w.start < 0 ||
        w.end < w.start || w.end > data.duration || (i && w.start < data.words[i - 1].start))) {
        throw new Error('Invalid Sky word timings');
      }
      for (const el of blocks) {
        const text = el.textContent;
        const fragment = document.createDocumentFragment();
        for (const piece of text.match(/\S+|\s+/g) || []) {
          if (/^\s+$/.test(piece)) fragment.append(document.createTextNode(piece));
          else {
            const span = document.createElement('span');
            span.className = 'word'; span.textContent = piece;
            spans.push(span); fragment.append(span);
          }
        }
        el.replaceChildren(fragment);
      }
      words = data.words; duration = data.duration;
      seek.max = duration;
      audio.src = data.audio;
      audio.playbackRate = Number(speed.value);
      ready = true;
      play.disabled = restart.disabled = seek.disabled = false;
      status.textContent = 'Ready'; render();
    } catch (error) {
      status.textContent = 'Narration is unavailable for this edition. The text is still available to read.';
      console.error('Sky reader:', error);
    }
  }
  load();
})();
