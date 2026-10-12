// StoreMaster license guard — managed automatically by StoreMaster.
const STOREMASTER_WORKER = "https://storemaster-worker.vivavoir150.workers.dev";

export async function onRequest(context) {
  const requestUrl = new URL(context.request.url);
  const pathname = requestUrl.pathname.replace(/\/+$/, "") || "/";
  // Keep the admin page available after expiry so the owner can see subscription details.
  // Protected admin APIs remain blocked by Worker session validation while expired.
  if (pathname === "/adm" || pathname === "/adm.html") return context.next();
  const host = requestUrl.hostname;
  const checkUrl = STOREMASTER_WORKER + "/api/store/license-status?site=" + encodeURIComponent(host);
  try {
    const response = await fetch(checkUrl, { headers: { "Accept": "application/json" } });
    const result = await response.json();
    if (response.ok && result && result.success === true && result.licensed === true) {
      return context.next();
    }
    return new Response("<!doctype html><html lang=\"ar\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>المتجر غير متاح</title><body style=\"font-family:Arial,sans-serif;text-align:center;padding:12vh 20px;direction:rtl\"><h1>المتجر غير متاح حاليًا</h1><p>انتهت صلاحية الترخيص أو أن الترخيص غير نشط. يرجى التواصل مع إدارة المتجر.</p></body></html>", {
      status: 403,
      headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store, max-age=0" }
    });
  } catch (_) {
    return new Response("خدمة التحقق من الترخيص غير متاحة مؤقتًا. يرجى المحاولة لاحقًا.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=UTF-8", "Cache-Control": "no-store, max-age=0" }
    });
  }
}
