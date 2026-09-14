// 診断用。APIキーの有無とDeepSeekの応答を確認する
export async function onRequest(context) {
  const { env } = context;
  const key = env.DEEPSEEK_API_KEY;
  const hasKey = typeof key === 'string' && key.length > 0;

  const started = Date.now();
  let result;

  try {
    // 10秒で打ち切る
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://api.deepseek.com/chat/completions', {
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
      signal: controller.signal,
    });

    clearTimeout(timer);
    result = { status: res.status, body: (await res.text()).slice(0, 300) };

  } catch (err) {
    result = { error: String(err) };
  }

  return new Response(
    JSON.stringify({ hasKey, keyLength: hasKey ? key.length : 0, ms: Date.now() - started, result }, null, 2),
    { headers: { 'Content-Type': 'application/json' } }
  );
}