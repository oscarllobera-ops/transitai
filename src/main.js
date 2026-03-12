import './styles.css';

const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const resultEl = document.getElementById('result');

async function send() {
  const input = inputEl.value;
  resultEl.textContent = 'Versturen...';
  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });
    const json = await res.json();
    if (!res.ok) throw json;
    resultEl.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    resultEl.textContent = 'Fout: ' + (err && err.error ? err.error : String(err));
  }
}

sendBtn.addEventListener('click', send);

// quick status check on load
fetch('/api/status').then(r=>r.json()).then(j=>console.log('backend status', j)).catch(()=>console.log('backend not reachable'));
