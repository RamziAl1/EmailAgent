/* ========================================
   script.js – plain vanilla JS (no drag‑&‑drop)
   ======================================== */

const API_URL = '/api/analyze';               // change to your real endpoint

// ---------- Elements ----------
const els = {
    textarea: document.getElementById('emailText'),
    fileInput: document.getElementById('fileInput'),
    chooseBtn: document.getElementById('chooseFileBtn'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    spinner: document.getElementById('spinner'),
    errorMsg: document.getElementById('errorMsg'),
    resultCard: document.getElementById('resultCard'),
    resultIcon: document.getElementById('resultIcon'),
    resultLabel: document.getElementById('resultLabel'),
    resultConf: document.getElementById('resultConf'),
    explList: document.getElementById('explanationList')
};

// ---------- Helpers ----------
const show = el => el.classList.remove('hidden');
const hide = el => el.classList.add('hidden');

const clearResult = () => {
    hide(els.resultCard);
    els.explList.innerHTML = '';
};
const setError = txt => {
    els.errorMsg.textContent = txt;
    show(els.errorMsg);
};
const clearError = () => hide(els.errorMsg);

// ---------- File picker ----------
function readFile(file) {
    if (!file.type.includes('text') && !file.name.endsWith('.eml')) {
        setError('Please select a text or .eml file.');
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        els.textarea.value = e.target.result;
        clearError();
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
}

// Open file picker on button click
els.chooseBtn.addEventListener('click', () => els.fileInput.click());
els.fileInput.addEventListener('change', () => {
    if (els.fileInput.files[0]) readFile(els.fileInput.files[0]);
});

// ---------- Analyze ----------
els.analyzeBtn.addEventListener('click', async () => {
    const email = els.textarea.value.trim();
    if (!email) return setError('Please paste an email or load a file first.');

    const mode = document.querySelector('input[name="mode"]:checked').value;

    clearResult();
    clearError();
    show(els.spinner);
    els.analyzeBtn.disabled = true;

    // renderResult({ label: "Spam", confidence: 0.95, explanation: ["Contains suspicious links", "Sender address is blacklisted"] });

    try {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${res.status}`);
    }

    const data = await res.json();
    renderResult(data);
    } catch (err) {
    setError(err.message);
    } finally {
    hide(els.spinner);
    els.analyzeBtn.disabled = false;
    }
});

// ---------- Render result ----------
function renderResult({ label, confidence, explanation = [] }) {
    const icons = {
        spam: `<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
        ham: `<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
        phishing: `<svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.94 4h13.88a1.88 1.88 0 001.88-1.88V7.88A1.88 1.88 0 0018.94 6H5.06A1.88 1.88 0 003.18 7.88v9.24a1.88 1.88 0 001.88 1.88z"/></svg>`
    };

    els.resultIcon.innerHTML = icons[label] || icons.phishing;
    els.resultLabel.textContent = label;
    els.resultConf.textContent = `${(confidence * 100).toFixed(1)}% confidence`;

    if (explanation.length) {
        els.explList.innerHTML = explanation.map(s => `<li>${s}</li>`).join('');
    } else {
        els.explList.innerHTML = '<li class="text-gray-500 italic">No detailed explanation returned.</li>';
    }

    show(els.resultCard);
}