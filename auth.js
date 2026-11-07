// Shared helpers for login / signup / account pages
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function nextUrl() {
  const n = new URLSearchParams(location.search).get("next") || "";
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : "/";
}
function digits(input) {
  input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, "").slice(0, 10); });
}
async function api(path, opts = {}) {
  const r = await fetch(path, {
    credentials: "same-origin",
    ...opts,
    headers: opts.body ? { "content-type": "application/json" } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data = {};
  try { data = await r.json(); } catch {}
  if (!r.ok) throw Object.assign(new Error(data.error || "Something went wrong. Please try again."), { status: r.status });
  return data;
}
async function me() { try { return (await api("/api/auth/me")).customer; } catch { return null; } }
function keepNext() {
  const q = location.search;
  document.querySelectorAll("a[data-keep]").forEach((a) => { a.href = a.getAttribute("href") + q; });
}
function submitForm(form, action, build) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]"), err = form.querySelector(".err");
    err.textContent = "";
    let payload;
    try { payload = build(); } catch (x) { err.textContent = x.message; return; }
    btn.disabled = true;
    try { await api(action, { method: "POST", body: payload }); location.href = nextUrl(); }
    catch (x) { err.textContent = x.message; btn.disabled = false; }
  });
}
function checkPhone(v) { if (!/^[6-9]\d{9}$/.test(v)) throw new Error("Enter a valid 10-digit mobile number"); return v; }
