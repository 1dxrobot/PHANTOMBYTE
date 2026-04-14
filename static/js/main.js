/* ═══════════════════════════════════════════════════════════════════
   PhantomByte — main.js
   ═══════════════════════════════════════════════════════════════════ */

/* ── Particle system ──────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function mkParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.7 ? '#39ff14' : '#00f5ff'
    };
  }

  for (let i = 0; i < 80; i++) particles.push(mkParticle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) Object.assign(p, mkParticle());
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Utility: Show alert ──────────────────────────────────────────── */
function showAlert(el, type, msg) {
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.textContent = msg;
  if (type === 'success') {
    setTimeout(() => el.classList.remove('show'), 4000);
  }
}

/* ── Utility: API POST ────────────────────────────────────────────── */
async function apiPost(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

/* ── Utility: API FormData ────────────────────────────────────────── */
async function apiForm(url, formData) {
  const res = await fetch(url, { method: 'POST', body: formData });

  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return res.json();   // TEXT mode
  } else {
    return res.blob();   // FILE/IMAGE mode
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SIGNUP
   ═══════════════════════════════════════════════════════════════════ */
(function initSignup() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  const pwInput = document.getElementById('password');
  const cpInput = document.getElementById('confirm_password');
  const alertBox = document.getElementById('alert');
  const submitBtn = document.getElementById('submit-btn');

  // Password strength
  const rules = {
    upper: { re: /[A-Z]/, el: document.getElementById('rule-upper') },
    lower: { re: /[a-z]/, el: document.getElementById('rule-lower') },
    number: { re: /[0-9]/, el: document.getElementById('rule-number') },
    special: { re: /[!@#$%^&*(),.?":{}|<>\[\]\\/_\-+=~`]/, el: document.getElementById('rule-special') },
    length: { re: /.{8,}/, el: document.getElementById('rule-length') }
  };

  const bar = document.getElementById('pw-bar-fill');

  pwInput && pwInput.addEventListener('input', function () {
    let score = 0;
    Object.values(rules).forEach(r => {
      const ok = r.re.test(this.value);
      if (r.el) r.el.classList.toggle('ok', ok);
      if (ok) score++;
    });
    const pct = (score / 5) * 100;
    if (bar) {
      bar.style.width = pct + '%';
      bar.style.background = pct < 40 ? '#ff2d55' : pct < 80 ? '#ffb800' : '#39ff14';
    }
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>INITIALIZING...';

    const data = {
      username: document.getElementById('username').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: pwInput.value,
      confirm_password: cpInput.value
    };

    try {
      const res = await apiPost('/api/signup', data);
      if (res.success) {
        showAlert(alertBox, 'success', res.message);
        setTimeout(() => window.location.href = res.redirect, 1500);
      } else {
        showAlert(alertBox, 'error', res.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'CREATE ACCOUNT';
      }
    } catch {
      showAlert(alertBox, 'error', 'Network error. Try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'CREATE ACCOUNT';
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════════════════════════════ */
(function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const alertBox = document.getElementById('alert');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>AUTHENTICATING...';

    const data = {
      identifier: document.getElementById('identifier').value.trim(),
      password: document.getElementById('password').value
    };

    try {
      const res = await apiPost('/api/login', data);
      if (res.success) {
        showAlert(alertBox, 'success', 'Access granted. Redirecting...');
        setTimeout(() => window.location.href = res.redirect, 800);
      } else {
        if (res.redirect) {
          showAlert(alertBox, 'info', res.message);
          setTimeout(() => window.location.href = res.redirect, 1500);
        } else {
          showAlert(alertBox, 'error', res.message);
          submitBtn.disabled = false;
          submitBtn.textContent = 'ACCESS SYSTEM';
        }
      }
    } catch {
      showAlert(alertBox, 'error', 'Network error. Try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'ACCESS SYSTEM';
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   OTP
   ═══════════════════════════════════════════════════════════════════ */
(function initOTP() {
  const inputs = document.querySelectorAll('.otp-inputs input');
  if (!inputs.length) return;

  const alertBox = document.getElementById('alert');
  const submitBtn = document.getElementById('submit-btn');

  inputs.forEach((inp, i) => {
    inp.addEventListener('input', function () {
      this.value = this.value.replace(/\D/, '');
      if (this.value && i < inputs.length - 1) inputs[i + 1].focus();
      this.classList.toggle('filled', !!this.value);
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !this.value && i > 0) inputs[i - 1].focus();
    });
    inp.addEventListener('paste', function (e) {
      const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      paste.split('').forEach((ch, j) => {
        if (inputs[j]) { inputs[j].value = ch; inputs[j].classList.add('filled'); }
      });
      if (inputs[paste.length - 1]) inputs[paste.length - 1].focus();
      e.preventDefault();
    });
  });

  const form = document.getElementById('otp-form');
  form && form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const otp = Array.from(inputs).map(i => i.value).join('');
    if (otp.length < 6) { showAlert(alertBox, 'error', 'Enter complete 6-digit OTP.'); return; }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>VERIFYING...';

    try {
      const res = await apiPost('/api/verify-otp', { otp });
      if (res.success) {
        showAlert(alertBox, 'success', res.message);
        setTimeout(() => window.location.href = res.redirect, 1500);
      } else {
        showAlert(alertBox, 'error', res.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'VERIFY OTP';
      }
    } catch {
      showAlert(alertBox, 'error', 'Network error.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'VERIFY OTP';
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   FORGOT PASSWORD
   ═══════════════════════════════════════════════════════════════════ */
(function initForgot() {
  const form = document.getElementById('forgot-form');
  if (!form) return;

  const alertBox = document.getElementById('alert');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>SENDING OTP...';

    const email = document.getElementById('email').value.trim();
    try {
      const res = await apiPost('/api/forgot-password', { email });
      if (res.success) {
        showAlert(alertBox, 'success', res.message);
        setTimeout(() => window.location.href = res.redirect, 1500);
      } else {
        showAlert(alertBox, 'error', res.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'SEND OTP';
      }
    } catch {
      showAlert(alertBox, 'error', 'Network error.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'SEND OTP';
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   RESET PASSWORD
   ═══════════════════════════════════════════════════════════════════ */
(function initReset() {
  const form = document.getElementById('reset-form');
  if (!form) return;

  const alertBox = document.getElementById('alert');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const data = {
      password: document.getElementById('password').value,
      confirm_password: document.getElementById('confirm_password').value
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>RESETTING...';

    try {
      const res = await apiPost('/api/reset-password', data);
      if (res.success) {
        showAlert(alertBox, 'success', res.message);
        setTimeout(() => window.location.href = res.redirect, 1500);
      } else {
        showAlert(alertBox, 'error', res.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'RESET PASSWORD';
      }
    } catch {
      showAlert(alertBox, 'error', 'Network error.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'RESET PASSWORD';
    }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   HOME — Encrypt / Decrypt
   ═══════════════════════════════════════════════════════════════════ */
(function initHome() {
  if (!document.getElementById('enc-panel')) return;

  // ── Tab switching ──
  function setupTabs(panelId, tabClass, activeClass) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    panel.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        const mode = this.dataset.mode;
        panel.querySelectorAll('.mode-tab').forEach(t => t.classList.remove(activeClass));
        this.classList.add(activeClass);
        panel.querySelectorAll('.mode-content').forEach(c => c.style.display = 'none');
        const target = panel.querySelector(`#${panelId}-${mode}`);
        if (target) target.style.display = 'block';
      });
    });
  }

  setupTabs('enc-panel', 'mode-tab', 'active-enc');
  setupTabs('dec-panel', 'mode-tab', 'active-dec');

  // ── File upload zone ──
  document.querySelectorAll('.upload-zone').forEach(zone => {
    const input = zone.querySelector('input[type=file]');
    const label = zone.querySelector('.file-name');
    const preview = zone.nextElementSibling;

    input && input.addEventListener('change', function () {
      if (!this.files.length) return;
      const file = this.files[0];
      if (label) label.textContent = file.name;

      // Show image preview
      if (preview && preview.classList.contains('img-preview') && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => { preview.src = e.target.result; preview.classList.add('show'); };
        reader.readAsDataURL(file);
      }
    });

    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag');
      if (input && e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
  });

  // ── ENCRYPT ──
  document.getElementById('encrypt-btn').addEventListener('click', async function () {
    const panel = document.getElementById('enc-panel');
    const activeTab = panel.querySelector('.mode-tab.active-enc');
    const mode = activeTab ? activeTab.dataset.mode : 'text';
    const alertBox = document.getElementById('enc-alert');
    const resultBox = document.getElementById('enc-result');
    const btn = this;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>ENCRYPTING...';

    const fd = new FormData();
    fd.append('mode', mode);

    if (mode === 'text') {
      const text = document.getElementById('enc-text').value;
      if (!text.trim()) { showAlert(alertBox, 'error', 'Enter text to encrypt.'); btn.disabled = false; btn.textContent = 'ENCRYPT'; return; }
      fd.append('text', text);
    } else {
      const fileInput = document.getElementById(`enc-file-${mode}`);
      if (!fileInput || !fileInput.files.length) {
        showAlert(alertBox, 'error', 'Please select a file.');
        btn.disabled = false; btn.textContent = 'ENCRYPT'; return;
      }
      fd.append('file', fileInput.files[0]);
    }

    try {
      const res = await apiForm('/api/encrypt', fd);

      if (res instanceof Blob) {
        // FILE MODE
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;

        const fileInput = document.getElementById(`enc-file-${mode}`);
        const originalName = fileInput.files[0].name;

        a.download = originalName + ".enc";
        a.click();

        showAlert(alertBox, 'success', 'File encrypted and downloaded.');
      }
      else if (res.success) {
        // TEXT MODE
        document.getElementById('enc-result-text').textContent = res.result;
        resultBox.classList.add('show');
        showAlert(alertBox, 'success', 'Encryption successful.');
      }
      else {
        showAlert(alertBox, 'error', res.message);
      }
    } catch {
      showAlert(alertBox, 'error', 'Encryption failed. Try again.');
    }

    btn.disabled = false;
    btn.textContent = 'ENCRYPT';
  });

  // ── DECRYPT ──
  document.getElementById('decrypt-btn').addEventListener('click', async function () {
    const panel = document.getElementById('dec-panel');
    const activeTab = panel.querySelector('.mode-tab.active-dec');
    const mode = activeTab ? activeTab.dataset.mode : 'text';
    const alertBox = document.getElementById('dec-alert');
    const resultBox = document.getElementById('dec-result');
    const btn = this;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>DECRYPTING...';

    const fd = new FormData();
    fd.append('mode', mode);

    if (mode === 'text') {
      const text = document.getElementById('dec-text').value;
      if (!text.trim()) { showAlert(alertBox, 'error', 'Enter text to decrypt.'); btn.disabled = false; btn.textContent = 'DECRYPT'; return; }
      fd.append('text', text);
    } else {
      const fileInput = document.getElementById(`dec-file-${mode}`);
      if (!fileInput || !fileInput.files.length) {
        showAlert(alertBox, 'error', 'Please select a file.');
        btn.disabled = false; btn.textContent = 'DECRYPT'; return;
      }
      fd.append('file', fileInput.files[0]);
    }

    try {
      const res = await apiForm('/api/decrypt', fd);

      if (res instanceof Blob) {
        // FILE MODE
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;

        const fileInput = document.getElementById(`dec-file-${mode}`);
        let name = fileInput.files[0].name.replace(".enc", "");

        a.download = name || "decrypted_file";
        a.click();

        showAlert(alertBox, 'success', 'File decrypted and downloaded.');
      }
      else if (res.success) {
        // TEXT MODE
        document.getElementById('dec-result-text').textContent = res.result;
        resultBox.classList.add('show');
        showAlert(alertBox, 'success', 'Decryption successful.');
      }
      else {
        showAlert(alertBox, 'error', res.message);
      }
    } catch {
      showAlert(alertBox, 'error', 'Decryption failed. Invalid token?');
    }

    btn.disabled = false;
    btn.textContent = 'DECRYPT';
  });

  // ── Copy buttons ──
  document.getElementById('enc-copy')?.addEventListener('click', function () {
    const text = document.getElementById('enc-result-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
      this.textContent = 'COPIED!';
      setTimeout(() => this.textContent = 'COPY', 1500);
    });
  });

  document.getElementById('dec-copy')?.addEventListener('click', function () {
    const text = document.getElementById('dec-result-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
      this.textContent = 'COPIED!';
      setTimeout(() => this.textContent = 'COPY', 1500);
    });
  });

  // ── Download buttons ──
  function downloadResult(boxId, defaultName) {
    const box = document.getElementById(boxId);
    const result = box.dataset.result;
    const type = box.dataset.type;

    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultName;
    a.click();
    URL.revokeObjectURL(url);
  }

  document.getElementById('enc-download')?.addEventListener('click', () => downloadResult('enc-result', 'encrypted.txt'));
  document.getElementById('dec-download')?.addEventListener('click', () => downloadResult('dec-result', 'decrypted.txt'));

  // ── Clear buttons ──
  document.getElementById('enc-clear')?.addEventListener('click', () => {
    document.getElementById('enc-text').value = '';
    document.getElementById('enc-result').classList.remove('show');
  });
  document.getElementById('dec-clear')?.addEventListener('click', () => {
    document.getElementById('dec-text').value = '';
    document.getElementById('dec-result').classList.remove('show');
  });
})();
