// 診断用：外部への通信が通るかを2か所で比較する
export async function onRequest(context) {
  const key = context.env.DEEPSEEK_API_KEY;

  async function tryFetch(label, url, options = {}) {
    const started = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      const body = (await res.text()).slice(0, 200);
      return { label, ms: Date.now() - started, status: res.status, body };
    } catch (err) {
      return { label, ms: Date.now() - started, error: String(err) };
    }
  }

  // ① 外部通信そのものが通るかの対照実験
  const control = await tryFetch('github', 'https://api.github.com/zen');

  // ② DeepSeek
  const deepseek = await tryFetch('deepseek', 'https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'deepseek-flash',
      max_tokens: 20,
      messages: [{ role: 'user', content: 'hi' }],
    }),
  });

  return new Response(JSON.stringify({ control, deepseek }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
}