// run-tests.mjs — Automated 15/15 Core Contract Checks (v0.1.0)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectAndEvaluate, renderCard } from './detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Легковесный мок DOM для контрактных проверок в чистом Node.js
function createMockDoc({ forms = [], links = [], hasPassword = false, elementCount = 10 } = {}) {
  const formNodes = forms.map(f => ({
    hidden: !!f.hidden,
    style: { display: f.display || 'block' },
    getAttribute: (name) => (name === 'action' ? f.action : null),
    querySelector: (sel) => (sel === 'input[type="password"]' && f.hasPassword !== false ? { hidden: !!f.pwdHidden, style: {} } : null)
  }));

  const linkNodes = links.map(l => ({
    textContent: l.text,
    getAttribute: (name) => (name === 'href' ? l.href : null)
  }));

  return {
    querySelectorAll: (sel) => {
      if (sel === '*') return new Array(elementCount);
      if (sel === 'a[href]') return linkNodes;
      if (sel === 'form') return formNodes;
      return [];
    },
    querySelector: (sel) => {
      if (sel === 'input[type="password"]') {
        return (hasPassword || forms.some(f => f.hasPassword !== false)) ? {} : null;
      }
      return null;
    }
  };
}

const tests = [
  ['01. Benign HTTPS page without forms produces Low observed risk', () => {
    const res = collectAndEvaluate(createMockDoc(), 'https://astanait.edu.kz/home');
    assert.equal(res.status, 'Low observed risk');
    assert.equal(res.coverage, 'complete');
  }],
  ['02. Rule A3-R01 triggers High risk when password form submits to HTTP', () => {
    const doc = createMockDoc({ forms: [{ action: 'http://fixture.test/login' }] });
    const res = collectAndEvaluate(doc, 'https://secure.portal.edu/login');
    assert.equal(res.status, 'High risk indicators');
    assert.ok(res.evidence.some(e => e.ruleId === 'A3-R01'));
  }],
  ['03. Rule A3-R02 triggers Caution when password form hostname differs', () => {
    const doc = createMockDoc({ forms: [{ action: 'https://sso.provider.org/auth' }] });
    const res = collectAndEvaluate(doc, 'https://portal.university.edu/login');
    assert.equal(res.status, 'Caution');
    assert.ok(res.evidence.some(e => e.ruleId === 'A3-R02'));
  }],
  ['04. Rule A3-R03 triggers Caution when visible URL link text differs from target host', () => {
    const doc = createMockDoc({ links: [{ text: 'https://astanait.edu.kz', href: 'https://phish-login.com/auth' }] });
    const res = collectAndEvaluate(doc, 'https://mail.astanait.edu.kz');
    assert.equal(res.status, 'Caution');
    assert.ok(res.evidence.some(e => e.ruleId === 'A3-R03'));
  }],
  ['05. Rule A3-R04 triggers High risk when HTTP page contains password input', () => {
    const doc = createMockDoc({ hasPassword: true });
    const res = collectAndEvaluate(doc, 'http://127.0.0.1:4173/demo/index.html');
    assert.equal(res.status, 'High risk indicators');
    assert.ok(res.evidence.some(e => e.ruleId === 'A3-R04'));
  }],
  ['06. Combined HTTP cross-host fixture triggers A3-R01, A3-R02, and A3-R04', () => {
    const doc = createMockDoc({ forms: [{ action: 'http://fixture.test/login' }], hasPassword: true });
    const res = collectAndEvaluate(doc, 'http://127.0.0.1:4173/demo/index.html');
    const ruleIds = res.evidence.map(e => e.ruleId);
    assert.deepEqual(ruleIds, ['A3-R01', 'A3-R02', 'A3-R04']);
  }],
  ['07. Observation A3-O01 records hidden password form without raising risk alone', () => {
    const doc = createMockDoc({ forms: [{ action: 'https://portal.edu/auth', hidden: true }] });
    const res = collectAndEvaluate(doc, 'https://portal.edu/login');
    assert.equal(res.status, 'Low observed risk');
    assert.ok(res.evidence.some(e => e.ruleId === 'A3-O01'));
  }],
  ['08. Exceeding 5,000 DOM elements produces Insufficient coverage', () => {
    const doc = createMockDoc({ elementCount: 5001 });
    const res = collectAndEvaluate(doc, 'https://portal.edu/');
    assert.equal(res.status, 'Insufficient coverage');
    assert.equal(res.coverage, 'partial');
  }],
  ['09. Unsupported chrome:// URL safely returns Unavailable state', () => {
    const res = collectAndEvaluate(createMockDoc(), 'chrome://extensions');
    assert.equal(res.status, 'Unavailable');
    assert.equal(res.coverage, 'unavailable');
  }],
  ['10. Null or inaccessible DOM document returns Unavailable state', () => {
    const res = collectAndEvaluate(null, 'https://portal.edu/');
    assert.equal(res.status, 'Unavailable');
  }],
  ['11. Condition E and Condition L share identical status, coverage, and action', () => {
    const doc = createMockDoc({ forms: [{ action: 'http://fixture.test/login' }], hasPassword: true });
    const res = collectAndEvaluate(doc, 'http://127.0.0.1:4173/demo/index.html');
    const htmlE = renderCard('E', res);
    const htmlL = renderCard('L', res);
    assert.ok(htmlE.includes(res.status) && htmlL.includes(res.status));
    assert.ok(htmlE.includes(res.action) && htmlL.includes(res.action));
  }],
  ['12. Condition E renders Observed reasons and rule IDs while Condition L omits them', () => {
    const doc = createMockDoc({ forms: [{ action: 'http://fixture.test/login' }], hasPassword: true });
    const res = collectAndEvaluate(doc, 'http://127.0.0.1:4173/demo/index.html');
    const htmlE = renderCard('E', res);
    const htmlL = renderCard('L', res);
    assert.ok(htmlE.includes('Observed reasons') && htmlE.includes('A3-R01'));
    assert.ok(!htmlL.includes('Observed reasons') && !htmlL.includes('A3-R01'));
  }],
  ['13. Privacy check: evidence output omits query strings, paths, and password values', () => {
    const doc = createMockDoc({ forms: [{ action: 'http://fixture.test/secret/path?token=mySecret123' }] });
    const res = collectAndEvaluate(doc, 'https://portal.edu/user?pass=hunter2');
    const serialized = JSON.stringify(res);
    assert.ok(!serialized.includes('mySecret123') && !serialized.includes('hunter2'));
  }],
  ['14. Same-host HTTPS password form triggers Low observed risk', () => {
    const doc = createMockDoc({ forms: [{ action: 'https://portal.edu/auth' }] });
    const res = collectAndEvaluate(doc, 'https://portal.edu/login');
    assert.equal(res.status, 'Low observed risk');
    assert.equal(res.evidence.length, 0);
  }],
  ['15. Non-URL link text does not falsely trigger A3-R03', () => {
    const doc = createMockDoc({ links: [{ text: 'Click here to sign in', href: 'https://other-host.org/login' }] });
    const res = collectAndEvaluate(doc, 'https://portal.edu/');
    assert.equal(res.status, 'Low observed risk');
  }]
];

let passed = 0;
const results = [];

console.log('Running Phishing Indicator Detector v0.1.0 Core Contract Checks...\n');
for (const [name, fn] of tests) {
  try {
    fn();
    passed++;
    results.push({ test: name, status: 'PASS' });
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    results.push({ test: name, status: 'FAIL', error: err.message });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

const evidenceDir = path.join(__dirname, 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(
  path.join(evidenceDir, 'node-results.json'),
  JSON.stringify({ version: '0.1.0', passed, total: tests.length, results }, null, 2)
);

console.log(`\nSummary: ${passed}/${tests.length} passed. Output written to evidence/node-results.json`);