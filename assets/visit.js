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

  const briefFields = `<div id="visit-brief-fields">
      ${briefKeys.map(name => `<label for="visit-${name}"></label><textarea rows="2" maxlength="2000" id="visit-${name}"></textarea>`).join('')}
      </div>`;
  const testMethods = {
    Understand: 'Write down your current explanation. Check it against a source or observation and record what changes your mind.',
    Decide: 'Compare your options using the same criterion. Record what would make you switch your choice.',
    Build: 'Try the smallest useful version. Record where it meets your criterion and where it falls short.'
  };
  function testMethod() {
    return testMethods[visit.intent] || 'Record what happens. Compare it with the evidence you chose and decide what to try next.';
  }

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
        <div class="visit-row"><input id="visit-question" type="text" required maxlength="500" placeholder="How can I make time to read after work?">
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
        <p id="visit-question-confirmed" role="status"></p>
        <fieldset><legend>What are you trying to do?</legend>
          <div class="visit-row">${Object.keys(prompts).map(intent => `<button type="button" data-intent="${intent}" aria-pressed="false">${intent}</button>`).join('')}</div>
        </fieldset>
        <p id="visit-intent-next"></p>
        <p>Turn your question into a small test. Name the evidence you would trust and one step you can take.</p>
        ${briefFields}
        <details class="visit-test-example">
          <summary>See an example of a small test</summary>
          <p>How can I make time to read after work? Tonight I’ll leave my phone in another room and set a 20-minute timer. I’ll note how long I read and what interrupted me.</p>
        </details>
        <p id="visit-plan-progress" role="status"></p>
        <a href="#visit-takeaway">Review your test plan</a>
      </div>
      <p class="visit-storage"></p>
    </section>`);
  const summary = mount('visit-summary', `
    <details><summary>Your thread</summary><p id="visit-thread"></p>
    <div class="visit-row"><a href="#visit-takeaway">Review your test plan</a>
    <a href="index.html#visit-opening">Change your question</a></div></details>`);
  const takeaway = mount('visit-takeaway', `
    <section class="visit-panel" aria-labelledby="visit-takeaway-title">
      <h2 id="visit-takeaway-title">Your takeaway</h2>
      <p>Put what you noticed into words you can use again.</p>
      <p id="visit-original"></p>
      <p id="visit-start-link"><a href="index.html#visit-opening">Start with a question</a></p>
      ${opening ? '' : briefFields}
      <section id="visit-plan-preview" hidden aria-labelledby="visit-plan-title">
        <h3 id="visit-plan-title">Your test plan</h3>
        <dl>
          <dt>Question to test</dt><dd id="visit-plan-question"></dd>
          <dt>Evidence to look for</dt><dd id="visit-plan-evidence"></dd>
          <dt>First step</dt><dd id="visit-plan-move"></dd>
        </dl>
        <p id="visit-plan-method"></p>
        <a href="index.html#visit-opening">Edit the plan</a>
      </section>
      <label for="visit-insight" id="visit-insight-label">What did you learn or notice?</label>
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
        <p class="section-number">Nuevo Flow · B1 · A supported view</p>
        <h3 id="visit-listening-title">Make an argument in three languages</h3>
        <p>I think public transport should improve because many people depend on it.</p>
        <label for="visit-lesson-language">Practice language</label>
        <select id="visit-lesson-language"><option value="es">Spanish</option><option value="vi">Vietnamese</option></select>
        <div id="visit-lesson-model">
          <p class="visit-lesson-phrase" id="visit-model-phrase" lang="es"></p>
          <details>
            <summary>Compare the Spanish and Vietnamese structures</summary>
            <dl class="visit-lesson-words">
              <div><dt>State your view</dt><dd><span lang="es">Creo que</span> · <span lang="vi">Tôi nghĩ</span></dd></div>
              <div><dt>Make the recommendation</dt><dd><span lang="es">debería mejorar</span> uses the conditional of <i lang="es">deber</i> with an infinitive. <span lang="vi">nên được cải thiện</span> uses <i lang="vi">nên</i> for “should” and <i lang="vi">được cải thiện</i> for “be improved.”</dd></div>
              <div><dt>Give a reason</dt><dd><span lang="es">porque</span> and <span lang="vi">vì</span> introduce why the change matters.</dd></div>
            </dl>
          </details>
        </div>
        <audio id="visit-lesson-audio" preload="none"></audio>
        <div class="visit-row">
          <button type="button" id="visit-listen">Listen to Spanish</button>
          <label for="visit-listen-speed">Speed</label>
          <select id="visit-listen-speed"><option value="1">Normal</option><option value="0.75">Slow</option></select>
        </div>
        <p id="visit-listen-status" role="status"></p>
        <button type="button" id="visit-practice-start" aria-expanded="false" aria-controls="visit-phrase-practice">Build the argument</button>
        <div id="visit-phrase-practice" hidden>
          <fieldset>
            <legend>Put the parts in order.</legend>
            <div class="visit-row" id="visit-phrase-words"></div>
          </fieldset>
          <p>Your argument: <strong id="visit-phrase-answer" lang="es"></strong></p>
          <p id="visit-phrase-status" role="status"></p>
          <div class="visit-row">
            <button type="button" id="visit-phrase-check" disabled>Check word order</button>
            <button type="button" id="visit-phrase-undo" disabled>Undo</button>
            <button type="button" id="visit-phrase-reset">Start over</button>
          </div>
        </div>
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
      visit.question && visit.brief.evidence?.trim() && visit.brief.move?.trim() && 'How to check\n' + testMethod(),
      visit.insight.trim() && 'What happened or what I learned\n' + visit.insight,
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
      find('visit-question-confirmed').textContent = visit.question ? 'Your question: ' + visit.question : '';
      find('visit-intent-next').textContent = visit.intent ? testMethod() : '';
      find('visit-plan-progress').textContent = visit.brief.evidence?.trim() && visit.brief.move?.trim()
        ? 'Your plan is ready to try.' : '';
    }
    document.querySelectorAll('.visit-storage').forEach(node => {
      node.textContent = storageAvailable ? 'Your visit is kept in this browser tab. You can clear it below.' :
        'Tab storage is unavailable. Your notes will last while this page stays open.';
    });
    if (!takeaway) return;
    find('visit-start-link').hidden = Boolean(visit.question);
    find('visit-original').textContent = visit.question ? 'Original question: ' + visit.question : '';
    find('visit-plan-preview').hidden = !visit.question;
    find('visit-plan-question').textContent = visit.brief.pursue?.trim() || visit.question;
    find('visit-plan-evidence').textContent = visit.brief.evidence?.trim() || 'Add the evidence you would trust.';
    find('visit-plan-move').textContent = visit.brief.move?.trim() || 'Add one step you can try.';
    find('visit-plan-method').textContent = testMethod();
    find('visit-insight-label').textContent = visit.question ? 'What happened when you tried it? (Optional)' : 'What did you learn or notice?';
    const activePrompts = prompts[visit.intent] || defaultPrompts;
    briefKeys.forEach((name, i) => {
      const input = find('visit-' + name);
      input.labels[0].textContent = activePrompts[i];
      if (name === 'pursue') input.placeholder = visit.question;
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
    find('visit-starters').hidden = true;
    find('visit-starters-toggle').setAttribute('aria-expanded', 'false');
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
    const models = {
      es: {
        name: 'Spanish', audio: 'es-supported-view-52ef16eb.wav',
        chunks: ['Creo que', 'el transporte público', 'debería mejorar', 'porque', 'muchas personas', 'dependen de él'],
        order: [3, 5, 1, 2, 0, 4],
      },
      vi: {
        name: 'Vietnamese', audio: 'vi-supported-view-853e3edd.wav',
        chunks: ['Tôi nghĩ', 'giao thông công cộng', 'nên được cải thiện', 'vì', 'nhiều người', 'phụ thuộc vào nó'],
        order: [4, 2, 0, 5, 3, 1],
      },
    };
    const audio = find('visit-lesson-audio');
    const listen = find('visit-listen');
    const speed = find('visit-listen-speed');
    const language = find('visit-lesson-language');
    const model = find('visit-lesson-model');
    const modelPhrase = find('visit-model-phrase');
    const status = find('visit-listen-status');
    const practice = find('visit-phrase-practice');
    const start = find('visit-practice-start');
    const words = find('visit-phrase-words');
    const answer = find('visit-phrase-answer');
    const feedback = find('visit-phrase-status');
    const check = find('visit-phrase-check');
    const undo = find('visit-phrase-undo');
    const reset = find('visit-phrase-reset');
    let selected = [];
    let playback = 0;
    let playing = false;
    const current = () => models[language.value];

    function stop() {
      playback += 1;
      playing = false;
      audio.pause();
      if (audio.readyState) audio.currentTime = 0;
      listen.textContent = 'Listen to ' + current().name;
    }

    function updatePhrase(message = '') {
      for (const button of words.querySelectorAll('button')) {
        button.disabled = selected.includes(Number(button.dataset.chunk));
      }
      answer.textContent = selected.map(index => current().chunks[index]).join(' ');
      feedback.textContent = message;
      check.disabled = selected.length !== current().chunks.length;
      undo.disabled = selected.length === 0;
    }

    function setPractice(open) {
      practice.hidden = !open;
      model.hidden = open;
      start.setAttribute('aria-expanded', String(open));
      start.textContent = open ? 'Show the model again' : 'Build the argument';
      selected = [];
      updatePhrase();
    }

    function loadLanguage() {
      stop();
      status.textContent = '';
      const { audio: filename, chunks, order } = current();
      audio.src = 'assets/app-samples/' + filename;
      modelPhrase.lang = answer.lang = language.value;
      modelPhrase.textContent = chunks.join(' ') + '.';
      words.replaceChildren(...order.map(index => {
        const button = document.createElement('button');
        button.type = 'button';
        button.lang = language.value;
        button.dataset.chunk = String(index);
        button.textContent = chunks[index];
        return button;
      }));
      setPractice(!practice.hidden);
    }

    resetListening = () => {
      language.value = 'es';
      speed.value = '1';
      setPractice(false);
      loadLanguage();
    };

    function reportAudioError() {
      stop();
      status.textContent = 'Audio could not play. Try Listen again or open the written model.';
    }

    speed.addEventListener('change', () => { audio.playbackRate = Number(speed.value); });
    language.addEventListener('change', loadLanguage);
    listen.addEventListener('click', async () => {
      if (playing) { stop(); return; }
      const attempt = ++playback;
      status.textContent = '';
      playing = true;
      listen.textContent = 'Stop ' + current().name;
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
      setPractice(practice.hidden);
      if (!practice.hidden) words.querySelector('button')?.focus();
    });
    words.addEventListener('click', ({ target }) => {
      const tile = target.closest('button[data-chunk]');
      if (!tile || tile.disabled) return;
      selected.push(Number(tile.dataset.chunk));
      updatePhrase('Added ' + tile.textContent + '.');
      (words.querySelector('button:not(:disabled)') || check).focus();
    });
    undo.addEventListener('click', () => {
      const restored = selected.pop();
      updatePhrase();
      words.querySelector('[data-chunk="' + restored + '"]')?.focus();
    });
    reset.addEventListener('click', () => {
      selected = [];
      updatePhrase();
      words.querySelector('button')?.focus();
    });
    check.addEventListener('click', () => {
      const correct = selected.every((index, position) => index === position);
      feedback.textContent = correct
        ? 'Correct. You stated your view, made a recommendation, and gave a reason. Try the other language with the same meaning.'
        : 'Start with the opinion and recommendation. Then add the connector and the reason. Use Undo to revise.';
      if (correct) {
        answer.textContent = current().chunks.join(' ') + '.';
        visit.attempts['Nuevo Flow'] = 'Built the B1 supported view in ' + current().name;
        save();
      }
    });

    loadLanguage();
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
