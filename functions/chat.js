// functions/chat.js
// Cloudflare Pages Functions で動くバックエンド。
// APIキーはここでだけ使い、フロントには絶対に渡さない。

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { userInput, systemPrompt } = await request.json();

    if (!userInput || !systemPrompt) {
      return json({ error: 'userInput と systemPrompt が必要です' }, 400);
    }

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-flash',
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userInput },
        ],
      }),
    });

    if (!res.ok) {
      console.error('DeepSeek error:', res.status, await res.text());
      return json({ error: 'AIへの問い合わせに失敗しました' }, 502);
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content ?? '';

    return json({ answer });

  } catch (err) {
    console.error(err);
    return json({ error: 'サーバー側でエラーが発生しました' }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}