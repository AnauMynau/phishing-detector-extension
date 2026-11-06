import { renderCard } from './practical/detector.js';

const outputEl = document.getElementById('popupOutput');
const modeSelect = document.getElementById('modeSelect');
let lastResult = null;

function inPageCollector() {
  const pageUrlStr = window.location.href;
  const pageUrl = new URL(pageUrlStr);
  const pageHostname = pageUrl.hostname;
  const isPageHttp = pageUrl.protocol === 'http:';

  const elements = document.querySelectorAll('*');
  const links = document.querySelectorAll('a[href]');
  const forms = document.querySelectorAll('form');
  const isComplete = elements.length <= 5000 && links.length <= 1000 && forms.length <= 100;

  const evidence = [];
  let evCounter = 1;
  let hasHighRisk = false;
  let hasCaution = false;

  forms.forEach((form, idx) => {
    if (idx >= 100) return;
    const pwdInput = form.querySelector('input[type="password"]');
    if (!pwdInput) return;
    const formId = `form-${idx + 1}`;
    let actionUrl;
    try {
      actionUrl = new URL(form.getAttribute('action') || pageUrlStr, pageUrlStr);
    } catch { return; }

    if (actionUrl.protocol === 'http:') {
      hasHighRisk = true;
      evidence.push({
        ruleId: 'A3-R01', target: formId, evId: `evidence-${evCounter++}`,
        claim: `A password form is set to submit to ${actionUrl.hostname} over unencrypted HTTP.`,
        caveat: 'This is its declared destination; scripts may change actual submission behaviour. Password values were not read.'
      });
    }
    if (actionUrl.hostname && actionUrl.hostname !== pageHostname) {
      hasCaution = true;
      evidence.push({
        ruleId: 'A3-R02', target: formId, evId: `evidence-${evCounter++}`,
        claim: `A password form declares ${actionUrl.hostname}, which differs from this page’s hostname ${pageHostname}.`,
        caveat: 'A separate sign-in provider or subdomain may be legitimate. This is exact hostname comparison, not registrable-domain analysis.'
      });
    }
  });

  if (isPageHttp && document.querySelector('input[type="password"]')) {
    hasHighRisk = true;
    evidence.push({
      ruleId: 'A3-R04', target: 'page', evId: `evidence-${evCounter++}`,
      claim: 'This HTTP page contains a password control.',
      caveat: 'The page itself is not protected by HTTPS; the form destination may differ. No password value was read.'
    });
  }

  let status = 'Low observed risk';
  let levelClass = 'low';
  let action = 'No implemented high-risk or caution rule triggered; continue to verify the address independently.';
  if (hasHighRisk) {
    status = 'High risk indicators'; levelClass = 'high';
    action = 'Do not enter credentials here; open the service through a known official address.';
  } else if (hasCaution) {
    status = 'Caution'; levelClass = 'caution';
    action = 'Verify the destination address before entering credentials; legitimate identity providers may also differ.';
  }

  return { status, levelClass, coverage: isComplete ? 'complete' : 'partial', action, evidence };
}

async function scanActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
      lastResult = {
        coverage: 'unavailable',
        reason: 'unsupported or unavailable document',
        action: 'Open a supported HTTP or HTTPS page and request a new scan.'
      };
    } else {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: inPageCollector
      });
      lastResult = result;
    }
  } catch {
    lastResult = {
      coverage: 'unavailable',
      reason: 'unsupported or unavailable document',
      action: 'Open a supported HTTP or HTTPS page and request a new scan.'
    };
  }
  outputEl.innerHTML = renderCard(modeSelect.value, lastResult);
}

document.getElementById('scanTabBtn').addEventListener('click', scanActiveTab);
modeSelect.addEventListener('change', () => {
  if (lastResult) outputEl.innerHTML = renderCard(modeSelect.value, lastResult);
});

scanActiveTab();