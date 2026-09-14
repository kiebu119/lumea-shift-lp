// ===== チャットボット =====
(() => {
  const widget = document.querySelector('.chat-widget');
  if (!widget) return;

  const trigger  = widget.querySelector('.chat-trigger');
  const closeBtn = widget.querySelector('.chat-close');
  const form     = widget.querySelector('.chat-form');
  const input    = widget.querySelector('.chat-input');
  const body     = widget.querySelector('.chat-body');

  // 公開したGoogle SheetsのCSV（rulesシート）
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCGm8yNDEaytW7QffLp8WY5i7JMDdoPZdGM_8Kt1uFhE8yGoEcN_1QWwIIiueAACJJ_MCwoPbHzzT9/pub?gid=1235997883&single=true&output=csv';

  let rules = [];   // ここにシートの中身が入る

  // --- 開閉 ---
  trigger.addEventListener('click', () => {
    widget.classList.toggle('is-open');
    if (widget.classList.contains('is-open')) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    widget.classList.remove('is-open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') widget.classList.remove('is-open');
  });

  // --- 吹き出しを1つ追加する ---
  function addMessage(who, text) {
    const el = document.createElement('div');
    el.className = 'msg msg-' + who;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  // --- Sheetsを読み込む（ページ表示時に1回だけ） ---
  async function loadRules() {
    try {
      // 末尾の &t= は開発中のキャッシュ対策。提出時は消してもよい
      const res = await fetch(CSV_URL + '&t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const text = await res.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      rules = parsed.data;

      console.log('ナレッジ読み込み完了:', rules);
    } catch (err) {
      console.error('ナレッジの読み込みに失敗しました:', err);
    }
  }
  loadRules();

  // --- 入力文とキーワードを照合して答えを決める ---
  function findAnswer(userInput) {
    if (rules.length === 0) {
      return '申し訳ございません、ただいま準備中です。少し時間をおいてお試しください。';
    }

    for (const row of rules) {
      if (!row.keyword) continue;                  // デフォルト行は最後に判定する
      const keys = row.keyword.split('|').map(k => k.trim()).filter(Boolean);
      if (keys.some(k => userInput.includes(k))) {
        return row.answer;
      }
    }

    // どれにも一致しなかった → keywordが空の行を返す
    const fallback = rules.find(row => !row.keyword);
    return fallback ? fallback.answer : 'お問い合わせフォームよりご連絡ください。';
  }

  // --- 送信されたとき ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';

    const reply = findAnswer(text);
    setTimeout(() => addMessage('bot', reply), 400);
  });

  // --- Enterキーで送信（日本語変換中は無視） ---
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
})();