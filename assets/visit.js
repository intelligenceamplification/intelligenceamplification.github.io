(() => {
  const key = 'ia-visit-v1';
  const find = id => document.getElementById(id);
  const empty = () => ({question: '', intent: '', brief: {}, insight: '', results: {}, attempts: {}, email: {}, service: ''});
  const string = value => typeof value === 'string' ? value : '';
  const fields = (value, keys) => Object.fromEntries(keys.map(name => [name, string(value?.[name])]));
  const prompts = {
    Understand: ['What remains unclear?', 'What evidence would help you understand it?', 'What could you look into first?'],
    Decide: ['What are you deciding between?', 'What evidence would distinguish the options?', 'What could you do before committing?'],
    Build: ['What is the smallest version you could test?', 'How would you know it works?', 'What can you make or test first?']
  };
  const services = {keynotes: 'Keynotes and Talks', workshops: 'Workshops for Teams and Communities', advisory: 'Strategic Advisory Briefings'};
  const resultKinds = ['Expression', 'Languages', 'Execution'];
  const defaultPrompts = ['What question do you want to pursue?', 'What would count as a useful answer?', 'What can you do first?'];
  const briefKeys = ['pursue', 'evidence', 'move'];

  function read() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (saved?.version !== 1) return empty();
      const {question, intent, brief, insight, results, attempts, email, service} = saved;
      return {
        question: string(question), intent: Object.hasOwn(prompts, intent) ? intent : '',
        brief: {...fields(brief, briefKeys), ...Object.fromEntries(resultKinds.map(kind => ['include' + kind, brief?.['include' + kind] === true]))}, insight: string(insight),
        results: fields(results, resultKinds), attempts: fields(attempts, ['Aware Presence', 'Nuevo Flow']),
        email: Object.fromEntries(['subject', 'body'].filter(k => typeof email?.[k] === 'string').map(k => [k, email[k]])),
        service: Object.hasOwn(services, service) ? service : ''
      };
    } catch { return empty(); }
  }

  let visit = read();
  let resetBreathing;
  let resetListening;
  let storageAvailable = true;
  function save() {
    try { sessionStorage.setItem(key, JSON.stringify({version: 1, ...visit})); }
    catch { storageAvailable = false; }
    refresh();
  }
  function mount(id, html) {
    const element = find(id);
    if (element) element.innerHTML = html;
    return element;
  }

  const opening = mount('visit-opening', `
    <section class="visit-opening" aria-labelledby="visit-heading">
      <h2 id="visit-heading">What would you like to make possible?</h2>
      <form id="visit-question-form">
        <label for="visit-question">Bring a question of your own</label>
        <div class="visit-row"><input id="visit-question" type="text" required maxlength="500">
        <button class="button dark" type="submit">Use this question</button></div>
      </form>
      <div class="visit-row visit-links">
        <button type="button" class="visit-link" id="visit-starters-toggle" aria-expanded="false" aria-controls="visit-starters">I’d like a starting point</button>
        <a href="#experience">Explore an example</a>
      </div>
      <div id="visit-starters" class="visit-row" hidden>
        <button type="button" data-starter>Make sense of AI for my team.</button>
        <button type="button" data-starter>Reclaim my attention.</button>
        <button type="button" data-starter>Learn a language deeply.</button>
      </div>
      <div id="visit-intents" hidden>
        <fieldset><legend>What are you trying to do?</legend>
          <div class="visit-row">${Object.keys(prompts).map(intent => `<button type="button" data-intent="${intent}" aria-pressed="false">${intent}</button>`).join('')}</div>
        </fieldset>
        <p id="visit-intent-next" role="status"></p>
        <a href="#visit-takeaway">Shape your brief</a>
      </div>
      <p class="visit-storage"></p>
    </section>`);
  const summary = mount('visit-summary', `
    <details><summary>Your thread</summary><p id="visit-thread"></p>
    <div class="visit-row"><a href="#visit-takeaway">Return to your brief</a>
    <a href="index.html#visit-opening">Change your question</a></div></details>`);
  const takeaway = mount('visit-takeaway', `
    <section class="visit-panel" aria-labelledby="visit-takeaway-title">
      <h2 id="visit-takeaway-title">Your takeaway</h2>
      <p>Put what you noticed into words you can use again.</p>
      <p id="visit-original"></p>
      <p id="visit-start-link"><a href="index.html#visit-opening">Start with a question</a></p>
      <div id="visit-brief-fields">
      ${briefKeys.map(name => `<label for="visit-${name}"></label><textarea rows="2" maxlength="2000" id="visit-${name}"></textarea>`).join('')}
      </div>
      <label for="visit-insight">What would you want to check in your own question?</label>
      <textarea id="visit-insight" rows="2" maxlength="2000"></textarea>
      <fieldset id="visit-choices" hidden><legend>Include prepared exercise notes</legend>
        ${resultKinds.map(kind => `<label hidden><input type="checkbox" data-result="${kind}"><span></span></label>`).join('')}
      </fieldset>
      <div class="visit-row">
        <button type="button" id="visit-copy">Copy takeaway</button>
        <button type="button" id="visit-print-button">Print takeaway</button>
        <button type="button" class="visit-link" id="visit-clear">Clear my visit</button>
      </div>
      <p class="visit-storage"></p>
      <details id="visit-composer">
        <summary>Prepare an email to Desmond</summary>
        <label for="visit-subject">Subject</label><input type="text" id="visit-subject">
        <label for="visit-body">Message</label><textarea rows="7" id="visit-body"></textarea>
        <p>Only what you see here is included.</p>
        <div class="visit-row">
          <a class="button dark" id="visit-mail" href="mailto:desmondwood@me.com">Continue by email</a>
          <button type="button" id="visit-copy-mail">Copy email draft</button>
        </div>
        <p id="visit-email-length" hidden>For a long message, copy the draft and paste it into your email app.</p>
      </details>
      <p id="visit-status" role="status"></p>
      <dialog id="visit-confirm" aria-labelledby="visit-confirm-message">
        <form method="dialog">
          <p id="visit-confirm-message"></p>
          <div class="visit-row"><button value="cancel" autofocus>Cancel</button><button id="visit-confirm-action" value="confirm">Continue</button></div>
        </form>
      </dialog>
      <textarea id="visit-copy-fallback" aria-label="Text to copy manually" readonly hidden></textarea>
    </section>`);
  const apps = mount('visit-apps', `
    <div class="visit-samples">
      <section aria-labelledby="visit-breathe-title">
        <p class="section-number">Aware Presence</p>
        <h3 id="visit-breathe-title">Peaceful Breathing</h3>
        <p>One round. Four seconds in, eight seconds out.</p>
        <div class="visit-breath-emblem">
          <div id="visit-breath-shape" aria-hidden="true"></div>
          <span id="visit-breath-count" role="timer" aria-label="Seconds remaining in this phase" hidden></span>
        </div>
        <p id="visit-breath-status" role="status">Ready when you are.</p>
        <div class="visit-row">
          <button type="button" id="visit-breathe">Begin</button>
          <button type="button" id="visit-breath-end" hidden>End</button>
        </div>
      </section>
      <section aria-labelledby="visit-listening-title">
        <p class="section-number">Nuevo Flow · A1 · Identity and origin</p>
        <h3 id="visit-listening-title">Say where you’re from in Spanish</h3>
        <p>Imagine someone asks where you’re from. Start with the reply “I’m from Indiana.”</p>
        <p class="visit-lesson-phrase" lang="es">Soy de Indiana.</p>
        <dl class="visit-lesson-words">
          <div><dt lang="es">Soy</dt><dd>I am</dd></div>
          <div><dt lang="es">de</dt><dd>from</dd></div>
          <div><dt lang="es">Indiana</dt><dd>Indiana</dd></div>
        </dl>
        <p>Listen and follow the words above. Then try saying the phrase aloud.</p>
        <audio id="visit-lesson-audio" preload="none" src="assets/app-samples/es-origin-native-castilian-a3dc7d41dd38-tempo85.m4a"></audio>
        <div class="visit-row">
          <button type="button" id="visit-listen">Listen to Spanish</button>
          <label for="visit-listen-speed">Speed</label>
          <select id="visit-listen-speed"><option value="1">Normal</option><option value="0.75">Slow</option></select>
        </div>
        <p id="visit-listen-status" role="status"></p>
        <button type="button" id="visit-practice-start" aria-expanded="false" aria-controls="visit-phrase-practice">Build the phrase</button>
        <div id="visit-phrase-practice" hidden>
          <fieldset id="visit-phrase-words">
            <legend>Put “I’m from Indiana” in Spanish word order.</legend>
            <div class="visit-row">
              <button type="button" lang="es" data-word="de">de</button>
              <button type="button" lang="es" data-word="Indiana">Indiana</button>
              <button type="button" lang="es" data-word="Soy">Soy</button>
            </div>
          </fieldset>
          <p>Your phrase: <strong id="visit-phrase-answer" lang="es"></strong></p>
          <p id="visit-phrase-status" role="status"></p>
          <button type="button" id="visit-phrase-reset">Start over</button>
        </div>
        <details class="visit-lesson-more">
          <summary>Compare another language</summary>
          <p><strong>Vietnamese</strong> · <span lang="vi">Mình đến từ Indiana.</span></p>
          <a href="index.html#language-xray">Explore the words in Language X-Ray</a>
        </details>
      </section>
    </div>`);
  const work = mount('visit-services', `
    <section class="visit-panel" aria-labelledby="visit-services-title">
      <h2 id="visit-services-title">What would help?</h2>
      <div class="visit-row">
        <button type="button" data-service="keynotes" aria-pressed="false">A talk for a group</button>
        <button type="button" data-service="workshops" aria-pressed="false">Practice with a team</button>
        <button type="button" data-service="advisory" aria-pressed="false">A decision to work through</button>
      </div>
      <div id="visit-service-detail" hidden>
        <h3 id="visit-service-name"></h3><p id="visit-service-description"></p>
        <div class="visit-row"><a id="visit-service-link" href="#keynotes">View the offering</a>
        <button type="button" id="visit-inquiry">Prepare an inquiry</button></div>
      </div>
    </section>`);

  function selectedNotes() {
    return resultKinds.filter(kind => visit.brief['include' + kind] === true && visit.results[kind]).map(kind => visit.results[kind]);
  }
  function takeawayText() {
    return [
      'Your takeaway', new Intl.DateTimeFormat(undefined, {dateStyle: 'long'}).format(new Date()),
      visit.question && 'Original question\n' + visit.question,
      visit.intent && 'Intent\n' + visit.intent,
      ...['Question to pursue', 'Useful answer or evidence', 'First move'].map((label, i) => {
        const value = visit.brief[briefKeys[i]];
        return value?.trim() ? label + '\n' + value : '';
      }),
      visit.insight.trim() && 'My insight\n' + visit.insight,
      selectedNotes().length && 'Prepared exercise notes\n' + selectedNotes().join('\n')
    ].filter(Boolean).join('\n\n');
  }

  function refresh() {
    if (summary) {
      summary.hidden = !visit.question;
      find('visit-thread').textContent = visit.question;
    }
    if (opening) {
      find('visit-intents').hidden = !visit.question;
      for (const button of opening.querySelectorAll('[data-intent]')) {
        button.setAttribute('aria-pressed', String(button.dataset.intent === visit.intent));
      }
      find('visit-intent-next').textContent = visit.intent ? prompts[visit.intent][0] : '';
    }
    document.querySelectorAll('.visit-storage').forEach(node => {
      node.textContent = storageAvailable ? 'Your visit is kept in this browser tab. You can clear it below.' :
        'Tab storage is unavailable. Your notes will last while this page stays open.';
    });
    if (!takeaway) return;
    find('visit-start-link').hidden = Boolean(visit.question);
    find('visit-original').textContent = visit.question ? 'Original question: ' + visit.question : '';
    const activePrompts = prompts[visit.intent] || defaultPrompts;
    briefKeys.forEach((name, i) => {
      const input = find('visit-' + name);
      takeaway.querySelector('label[for="' + input.id + '"]').textContent = activePrompts[i];
      if (input !== document.activeElement) input.value = visit.brief[name] || '';
    });
    if (find('visit-insight') !== document.activeElement) find('visit-insight').value = visit.insight;
    find('visit-brief-fields').hidden = !visit.question && !briefKeys.some(name => visit.brief[name]);
    const notes = takeaway.querySelectorAll('[data-result]');
    find('visit-choices').hidden = !resultKinds.some(kind => visit.results[kind]);
    for (const input of notes) {
      const kind = input.dataset.result;
      input.parentElement.hidden = !visit.results[kind];
      input.checked = visit.brief['include' + kind] === true;
      input.nextElementSibling.textContent = visit.results[kind] || '';
    }
    const subject = find('visit-subject');
    const body = find('visit-body');
    if (subject !== document.activeElement) subject.value = visit.email.subject ?? (visit.service ? 'Inquiry about ' + services[visit.service] : 'A conversation about Intelligence Amplification');
    if (body !== document.activeElement) {
      const greeting = visit.service ? 'Hello Desmond,\n\nI’d like to discuss ' + services[visit.service].toLowerCase() + '.\n\nAudience:\nContext:\nDesired outcome:' : 'Hello Desmond,';
      const hasTakeaway = visit.question || visit.insight || briefKeys.some(name => visit.brief[name]) || selectedNotes().length;
      body.value = visit.email.body ?? greeting + (hasTakeaway ? '\n\n' + takeawayText() : '\n\n');
    }
    const mail = 'mailto:desmondwood@me.com?subject=' + encodeURIComponent(subject.value.replace(/[\r\n]+/g, ' ').toWellFormed()) + '&body=' + encodeURIComponent(body.value.toWellFormed());
    find('visit-email-length').hidden = mail.length <= 1800;
    find('visit-mail').href = mail.length <= 1800 ? mail : 'mailto:desmondwood@me.com';
    if (work) showService();
  }

  function showService() {
    for (const button of work.querySelectorAll('[data-service]')) {
      button.setAttribute('aria-pressed', String(visit.service === button.dataset.service));
    }
    const panel = find('visit-service-detail');
    const offering = visit.service && find(visit.service);
    panel.hidden = !offering;
    if (!offering) return;
    find('visit-service-name').textContent = offering.querySelector('h2').textContent;
    find('visit-service-description').textContent = offering.querySelector('p').textContent;
    find('visit-service-link').href = '#' + visit.service;
  }

  function confirmChange(message, label, action) {
    const dialog = find('visit-confirm');
    dialog.returnValue = '';
    find('visit-confirm-message').textContent = message;
    find('visit-confirm-action').textContent = label;
    dialog.showModal();
    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'confirm') action();
    }, {once: true});
  }

  function useQuestion(value, confirmed = false) {
    if (!value.trim()) return;
    if (visit.question && visit.question !== value) {
      const hasNotes = Object.values(visit.brief).some(Boolean) || visit.insight || Object.values(visit.results).some(Boolean);
      if (hasNotes && !confirmed) {
        confirmChange('Replace your question and clear its brief and exercise notes? Your edited email draft will be kept.', 'Replace question', () => useQuestion(value, true));
        return;
      }
      Object.assign(visit, {intent: '', brief: {}, insight: '', results: {}, attempts: {}});
    }
    visit.question = value;
    find('visit-question').setCustomValidity('');
    find('visit-question').value = value;
    save();
    opening.querySelector('[data-intent]').focus();
  }

  if (opening) {
    opening.hidden = false;
    find('visit-question').value = visit.question;
    const questionInput = find('visit-question');
    questionInput.addEventListener('input', () => questionInput.setCustomValidity(''));
    find('visit-question-form').addEventListener('submit', event => {
      event.preventDefault();
      if (!questionInput.value.trim()) {
        questionInput.setCustomValidity('Enter a question to continue.');
        questionInput.reportValidity();
        return;
      }
      useQuestion(questionInput.value);
    });
    find('visit-starters-toggle').addEventListener('click', event => {
      const starters = find('visit-starters');
      starters.hidden = !starters.hidden;
      event.currentTarget.setAttribute('aria-expanded', String(!starters.hidden));
    });
    opening.querySelectorAll('[data-starter]').forEach(button => button.addEventListener('click', () => useQuestion(button.textContent)));
    opening.querySelectorAll('[data-intent]').forEach(button => button.addEventListener('click', () => {
      visit.intent = button.dataset.intent;
      save();
    }));
  }

  async function copy(value) {
    const status = find('visit-status');
    const fallback = find('visit-copy-fallback');
    try {
      await navigator.clipboard.writeText(value);
      fallback.hidden = true;
      status.textContent = 'Copied.';
    } catch {
      fallback.hidden = false;
      fallback.value = value;
      fallback.select();
      status.textContent = 'Select and copy the text below.';
    }
  }

  if (takeaway) {
    takeaway.hidden = false;
    for (const name of briefKeys) find('visit-' + name).addEventListener('input', event => {
      visit.brief[name] = event.target.value;
      save();
    });
    for (const input of takeaway.querySelectorAll('[data-result]')) input.addEventListener('change', () => {
      visit.brief['include' + input.dataset.result] = input.checked;
      save();
    });
    find('visit-insight').addEventListener('input', event => { visit.insight = event.target.value; save(); });
    for (const name of ['subject', 'body']) find('visit-' + name).addEventListener('input', event => {
      visit.email[name] = event.target.value;
      save();
    });
    find('visit-copy').addEventListener('click', () => copy(takeawayText()));
    find('visit-copy-mail').addEventListener('click', () => copy(find('visit-subject').value + '\n\n' + find('visit-body').value));
    find('visit-print-button').addEventListener('click', () => {
      find('visit-print').textContent = takeawayText();
      document.body.classList.add('visit-printing');
      window.print();
    });
    find('visit-clear').addEventListener('click', () => confirmChange(
      'Clear your question, notes, and edited email draft from this visit?', 'Clear visit', () => {
      visit = empty();
      resetBreathing?.();
      resetListening?.();
      if (opening) {
        find('visit-question').value = '';
        find('visit-question').setCustomValidity('');
      }
      find('visit-copy-fallback').value = '';
      find('visit-copy-fallback').hidden = true;
      find('visit-print').textContent = '';
      save();
      find('visit-status').textContent = 'Visit cleared.';
    }));
  }
  if (work) {
    work.hidden = false;
    work.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
      visit.service = button.dataset.service;
      save();
    }));
    find('visit-inquiry').addEventListener('click', () => {
      find('visit-composer').open = true;
      find('visit-subject').focus();
    });
  }
  function mountBreathing() {
    const inhaleMs = 4000;
    const exhaleMs = 8000;
    const duration = inhaleMs + exhaleMs;
    const button = find('visit-breathe');
    const end = find('visit-breath-end');
    const status = find('visit-breath-status');
    const shape = find('visit-breath-shape');
    const count = find('visit-breath-count');
    let frame, startedAt, elapsed = 0;
    let mode = 'ready';

    function finish(message) {
      cancelAnimationFrame(frame);
      mode = 'ready';
      elapsed = 0;
      count.hidden = true;
      shape.style.removeProperty('--visit-breath-scale');
      status.textContent = message;
      button.textContent = 'Begin';
      if (end === document.activeElement) button.focus();
      end.hidden = true;
    }

    function render(ms) {
      const inhale = ms < inhaleMs;
      const remaining = (inhale ? inhaleMs : duration) - ms;
      const progress = 1 - remaining / (inhale ? inhaleMs : exhaleMs);
      const eased = (1 - Math.cos(Math.PI * progress)) / 2;
      shape.style.setProperty('--visit-breath-scale', 0.03 + 0.97 * (inhale ? eased : 1 - eased));
      const number = String(Math.ceil(remaining / 1000));
      if (count.textContent !== number) count.textContent = number;
      const phase = inhale ? 'Breathe In' : 'Breathe Out';
      if (status.textContent !== phase) status.textContent = phase;
    }

    function tick(now) {
      if (mode !== 'running') return;
      const ms = elapsed + Math.max(0, now - startedAt);
      if (ms >= duration) {
        visit.attempts['Aware Presence'] = 'Completed';
        finish('Return to natural breathing. Witness its effortless rhythm.');
        save();
        return;
      }
      render(ms);
      frame = requestAnimationFrame(tick);
    }

    resetBreathing = () => finish('Ready when you are.');
    button.addEventListener('click', () => {
      if (mode === 'running') {
        elapsed += performance.now() - startedAt;
        mode = 'paused';
        cancelAnimationFrame(frame);
        status.textContent = 'Paused';
        button.textContent = 'Resume';
        return;
      }
      if (mode === 'ready') {
        visit.attempts['Aware Presence'] = 'Started';
        count.hidden = false;
        end.hidden = false;
        save();
      }
      mode = 'running';
      startedAt = performance.now();
      button.textContent = 'Pause';
      tick(startedAt);
    });
    end.addEventListener('click', () => {
      visit.attempts['Aware Presence'] = 'Stopped';
      finish('Return to natural breathing.');
      save();
    });
  }

  function mountListening() {
    const audio = find('visit-lesson-audio');
    const listen = find('visit-listen');
    const speed = find('visit-listen-speed');
    const status = find('visit-listen-status');
    const practice = find('visit-phrase-practice');
    const start = find('visit-practice-start');
    const words = Array.from(find('visit-phrase-words').querySelectorAll('[data-word]'));
    const answer = find('visit-phrase-answer');
    const feedback = find('visit-phrase-status');
    const reset = find('visit-phrase-reset');
    let selected = [];
    let playback = 0;

    function stop() {
      playback += 1;
      audio.pause();
      if (audio.readyState) audio.currentTime = 0;
      listen.textContent = 'Listen to Spanish';
    }

    function resetPhrase() {
      selected = [];
      answer.textContent = '';
      feedback.textContent = '';
      words.forEach(word => { word.disabled = false; });
    }

    resetListening = () => {
      stop();
      resetPhrase();
      practice.hidden = true;
      start.setAttribute('aria-expanded', 'false');
      status.textContent = '';
    };

    function reportAudioError() {
      stop();
      status.textContent = 'Audio could not play. Try listening again or build the phrase using the words above.';
    }

    speed.addEventListener('change', () => { audio.playbackRate = Number(speed.value); });
    listen.addEventListener('click', async () => {
      if (listen.textContent === 'Stop Spanish') {
        stop();
        return;
      }
      const attempt = ++playback;
      status.textContent = '';
      listen.textContent = 'Stop Spanish';
      try {
        audio.playbackRate = Number(speed.value);
        await audio.play();
      } catch {
        if (attempt === playback) reportAudioError();
      }
    });
    audio.addEventListener('error', reportAudioError);
    audio.addEventListener('ended', stop);

    start.addEventListener('click', () => {
      practice.hidden = !practice.hidden;
      start.setAttribute('aria-expanded', String(!practice.hidden));
      if (!practice.hidden) (words.find(word => !word.disabled) || reset).focus();
    });
    reset.addEventListener('click', () => {
      resetPhrase();
      words[0].focus();
    });
    words.forEach(word => word.addEventListener('click', () => {
      selected.push(word.dataset.word);
      word.disabled = true;
      answer.textContent = selected.join(' ');
      const next = words.find(candidate => !candidate.disabled);
      if (next) {
        feedback.textContent = 'Added ' + word.dataset.word + '. Choose the next word.';
        next.focus();
        return;
      }
      const correct = answer.textContent === 'Soy de Indiana';
      if (correct) answer.textContent += '.';
      feedback.textContent = correct
        ? 'You built “I’m from Indiana.” Say the whole phrase aloud.'
        : 'Try again. Start with the word for “I am,” then add “from” and the place.';
      visit.attempts['Nuevo Flow'] = correct ? 'Built the A1 introduction in Spanish' : 'Practiced the A1 introduction in Spanish';
      save();
      reset.focus();
    }));
  }

  if (apps) {
    apps.hidden = false;
    mountBreathing();
    mountListening();
  }
  document.addEventListener('ia-exercise', event => {
    const {kind, result} = event.detail;
    if (!resultKinds.includes(kind)) return;
    if (visit.results[kind] !== result) visit.brief['include' + kind] = false;
    visit.results[kind] = result;
    if (kind === 'Languages') visit.attempts['Nuevo Flow'] = 'Inspected a word';
    save();
  });
  document.addEventListener('ia-download', () => {
    const status = find('visit-download-status');
    if (status) status.textContent = status.textContent === 'Download started.' ? 'Download started again.' : 'Download started.';
  });
  window.addEventListener('afterprint', () => document.body.classList.remove('visit-printing'));
  window.addEventListener('pageshow', event => {
    if (!event.persisted || !storageAvailable) return;
    visit = read();
    if (opening) find('visit-question').value = visit.question;
    refresh();
  });
  refresh();
})();
