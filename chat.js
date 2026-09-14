// chat.js（フロント側／ブラウザで動く）
(() => {
  const widget = document.querySelector('.chat-widget');
  if (!widget) return;

  const trigger  = widget.querySelector('.chat-trigger');
  const closeBtn = widget.querySelector('.chat-close');
  const form     = widget.querySelector('.chat-form');
  const input    = widget.querySelector('.chat-input');
  const sendBtn  = widget.querySelector('.chat-send');
  const body     = widget.querySelector('.chat-body');

  // ナレッジ（knowledgeシート）
  const KNOWLEDGE_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCGm8yNDEaytW7QffLp8WY5i7JMDdoPZdGM_8Kt1uFhE8yGoEcN_1QWwIIiueAACJJ_MCwoPbHzzT9/pub?gid=0&single=true&output=csv';

  // 自分のバックエンド。LLM APIには直接アクセスしない
  const API_ENDPOINT = '/chat';

  let systemPrompt = '';

  // --- 開閉 ---
  trigger.addEventListener('click', () => {
    widget.classList.toggle('is-open');
    if (widget.classList.contains('is-open')) input.focus();
  });

  closeBtn.addEventListener('click', () => widget.classList.remove('is-open'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') widget.classList.remove('is-open');
  });

  // --- 吹き出しを追加して、その要素を返す ---
  function addMessage(who, text) {
    const el = document.createElement('div');
    el.className = 'msg msg-' + who;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  // --- システムプロンプトを組み立てる ---
  function buildSystemPrompt(rows) {
    const knowledgeText = rows
      .filter(row => row.question && row.answer)
      .map(row => `Q: ${row.question}\nA: ${row.answer}`)
      .join('\n\n');

    return `あなたはLUMEA SHIFTの公式サイトの窓口担当です。
以下の【情報】だけを根拠に、日本語で簡潔に（2〜3文程度で）回答してください。

守ること：
- 【情報】に書かれていないことは、絶対に推測で答えない
- 答えられない場合は「申し訳ございません、その点はお答えしかねます。お問い合わせフォームよりご連絡ください。」とだけ返す
- 商品と関係のない話題（天気、雑談、他社との比較、プログラミングなど）には応じず、同じ定型文を返す
- 価格や条件の数字は【情報】の通りに正確に答え、勝手に割引や例外を作らない
- 丁寧語で答え、絵文字は使わない

【情報】
${knowledgeText}`;
  }

  // --- ナレッジ読み込み（ページ表示時に1回だけ） ---
  async function loadKnowledge() {
    try {
      const res = await fetch(KNOWLEDGE_CSV + '&t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const text = await res.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      systemPrompt = buildSystemPrompt(parsed.data);

      console.log('ナレッジ読み込み完了:', parsed.data.length + '件');
    } catch (err) {
      console.error('ナレッジの読み込みに失敗しました:', err);
    }
  }
  loadKnowledge();

    // --- バックエンドに質問を投げる（20秒でタイムアウト） ---
  async function askBot(userInput) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, systemPrompt }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.answer) {
        throw new Error(data.error || ('HTTP ' + res.status));
      }
      return data.answer;

    } finally {
      clearTimeout(timer);
    }
  }

  // --- 送信 ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    if (!systemPrompt) {
      addMessage('bot', '申し訳ございません、ただいま準備中です。少し時間をおいてお試しください。');
      return;
    }

    addMessage('user', text);
    input.value = '';

    input.disabled = true;
    sendBtn.disabled = true;

    const thinking = addMessage('bot', '考えています…');
    thinking.classList.add('is-thinking');

    try {
      const answer = await askBot(text);
      thinking.textContent = answer;
    } catch (err) {
      console.error('回答の取得に失敗しました:', err);
      thinking.textContent = '申し訳ございません、ただいま接続できません。お手数ですが、お問い合わせフォームよりご連絡ください。';
    } finally {
      thinking.classList.remove('is-thinking');
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
      body.scrollTop = body.scrollHeight;
    }
  });

  // --- Enterで送信（日本語変換中は無視） ---
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
})();