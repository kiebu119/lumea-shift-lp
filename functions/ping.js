// 動作確認用。DeepSeekを呼ばずに即座に返すだけの関数
export function onRequest() {
  return new Response(JSON.stringify({ ok: true, message: "functions are working" }), {
    headers: { 'Content-Type': 'application/json' }
  });
}