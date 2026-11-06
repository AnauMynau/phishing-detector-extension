// detector.js — Core v0.1.0: Bounded Collector, Shared Evidence Policy & Renderer

export function collectAndEvaluate(doc, pageUrlStr) {
  if (!doc || !pageUrlStr || (!pageUrlStr.startsWith('http://') && !pageUrlStr.startsWith('https://'))) {
    return {
      status: 'Unavailable',
      levelClass: 'unavailable',
      coverage: 'unavailable',
      reason: 'unsupported or unavailable document',
      action: 'Open a supported HTTP or HTTPS page and request a new scan.',
      evidence: []
    };
  }

  let pageUrl;
  try {
    pageUrl = new URL(pageUrlStr);
  } catch {
    return {
      status: 'Unavailable',
      levelClass: 'unavailable',
      coverage: 'unavailable',
      reason: 'unsupported or unavailable document',
      action: 'Open a supported HTTP or HTTPS page and request a new scan.',
      evidence: []
    };
  }

  const pageHostname = pageUrl.hostname;
  const isPageHttp = pageUrl.protocol === 'http:';

  const elements = doc.querySelectorAll('*');
  const links = doc.querySelectorAll('a[href]');
  const forms = doc.querySelectorAll('form');

  const isComplete = elements.length <= 5000 && links.length <= 1000 && forms.length <= 100;
  const coverage = isComplete ? 'complete' : 'partial';

  const evidence = [];
  let evCounter = 1;
  let hasHighRisk = false;
  let hasCaution = false;

  forms.forEach((form, idx) => {
    if (idx >= 100) return;
    const pwdInput = form.querySelector('input[type="password"]');
    if (!pwdInput) return;

    const formId = `form-${idx + 1}`;
    const rawAction = form.getAttribute('action') || pageUrlStr;
    let actionUrl;
    try {
      actionUrl = new URL(rawAction, pageUrlStr);
    } catch {
      return;
    }

    // A3-R01: Password form declares HTTP destination
    if (actionUrl.protocol === 'http:') {
      hasHighRisk = true;
      evidence.push({
        ruleId: 'A3-R01',
        target: formId,
        evId: `evidence-${evCounter++}`,
        claim: `A password form is set to submit to ${actionUrl.hostname} over unencrypted HTTP.`,
        caveat: 'This is its declared destination; scripts may change actual submission behaviour. Password values were not read.'
      });
    }

    // A3-R02: Password destination hostname differs
    if (actionUrl.hostname && actionUrl.hostname !== pageHostname) {
      hasCaution = true;
      evidence.push({
        ruleId: 'A3-R02',
        target: formId,
        evId: `evidence-${evCounter++}`,
        claim: `A password form declares ${actionUrl.hostname}, which differs from this page’s hostname ${pageHostname}.`,
        caveat: 'A separate sign-in provider or subdomain may be legitimate. This is exact hostname comparison, not registrable-domain analysis.'
      });
    }

    // A3-O01: Скрытая форма или поле пароля
    const isHidden = form.hidden || pwdInput.hidden || form.style?.display === 'none' || pwdInput.style?.display === 'none';
    if (isHidden) {
      evidence.push({
        ruleId: 'A3-O01',
        target: formId,
        evId: `evidence-${evCounter++}`,
        claim: 'A sampled password control or form is hidden in the initial DOM.',
        caveat: 'Context only; hidden sign-in modals are common and do not raise the risk level alone.'
      });
    }
  });

  // Проверка ссылок (Правило A3-R03: Visible URL label differs from link target hostname)
  links.forEach((link, idx) => {
    if (idx >= 1000) return;
    const visibleText = (link.textContent || '').trim();
    if (/^https?:\/\//i.test(visibleText)) {
      try {
        const visibleUrl = new URL(visibleText);
        const hrefUrl = new URL(link.getAttribute('href'), pageUrlStr);
        if (visibleUrl.hostname && hrefUrl.hostname && visibleUrl.hostname !== hrefUrl.hostname) {
          hasCaution = true;
          evidence.push({
            ruleId: 'A3-R03',
            target: `link-${idx + 1}`,
            evId: `evidence-${evCounter++}`,
            claim: `Visible link text shows ${visibleUrl.hostname}, but target hostname is ${hrefUrl.hostname}.`,
            caveat: 'Redirect wrappers or tracking links may also cause hostname differences.'
          });
        }
      } catch {
        // Игнорируем невалидные URL
      }
    }
  });

  // Правило A3-R04: HTTP page has a password control
  const anyPassword = doc.querySelector('input[type="password"]');
  if (isPageHttp && anyPassword) {
    hasHighRisk = true;
    evidence.push({
      ruleId: 'A3-R04',
      target: 'page',
      evId: `evidence-${evCounter++}`,
      claim: 'This HTTP page contains a password control.',
      caveat: 'The page itself is not protected by HTTPS; the form destination may differ. No password value was read.'
    });
  }

  let label = 'Low observed risk';
  let levelClass = 'low';
  let action = 'No implemented high-risk or caution rule triggered; continue to verify the address independently.';

  if (hasHighRisk) {
    label = 'High risk indicators';
    levelClass = 'high';
    action = 'Do not enter credentials here; open the service through a known official address.';
  } else if (hasCaution) {
    label = 'Caution';
    levelClass = 'caution';
    action = 'Verify the destination address before entering credentials; legitimate identity providers may also differ.';
  } else if (!isComplete) {
    label = 'Insufficient coverage';
    levelClass = 'unavailable';
    action = 'Page exceeded static element limits; verify independently.';
  }

  return {
    status: label,
    levelClass,
    coverage,
    action,
    evidence
  };
}

export function renderCard(condition, result) {
  const isExplanation = condition === 'E';
  const title = isExplanation ? 'Condition E — explanation' : 'Condition L — label';
  const footerNote = 'This snapshot checks declared URLs and selected DOM metadata. It cannot prove intent or observe JavaScript-intercepted submissions, closed shadow roots, future changes or unscanned frames.';

  if (result.coverage === 'unavailable') {
    return `
      <div class="card">
        <div class="cond-title">${title}</div>
        <div class="alert-box unavailable">
          <div class="risk-label">Unavailable</div>
          <div class="coverage">Coverage: unavailable</div>
          <p class="reason-text">${result.reason}</p>
          <p class="action-text">${result.action}</p>
          <div class="footer-note">${footerNote}</div>
        </div>
      </div>`;
  }

  let reasonsHtml = '';
  if (isExplanation && result.evidence.length > 0) {
    const items = result.evidence.map(ev => `
      <li>
        <div class="claim">${ev.claim}</div>
        <div class="caveat">${ev.caveat}</div>
        <div class="meta">${ev.ruleId} · ${ev.target} · ${ev.evId}</div>
      </li>
    `).join('');
    reasonsHtml = `
      <div class="reasons-heading">Observed reasons</div>
      <ul class="reasons-list">${items}</ul>
    `;
  }

  return `
    <div class="card">
      <div class="cond-title">${title}</div>
      <div class="alert-box ${result.levelClass}">
        <div class="risk-label">${result.status}</div>
        <div class="coverage">Coverage: ${result.coverage}</div>
        <p class="action-text">${result.action}</p>
        ${reasonsHtml}
        <div class="footer-note">${footerNote}</div>
      </div>
    </div>`;
}