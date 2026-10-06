/*
 * Lead form configuration.
 * Submissions are POSTed as JSON to FORM_ENDPOINT (works with Formspree, Web3Forms, etc.).
 * Until an endpoint is set, the form falls back to opening the visitor's email client.
 */
const CONFIG = {
  FORM_ENDPOINT: "",                 // e.g. "https://formspree.io/f/xxxxxxxx"
  WEB3FORMS_KEY: "541f2bc3-538b-4c65-b6ef-3e4688da324a",                 // alternative: access key from web3forms.com (uses its endpoint)
  CONTACT_PHONE: "+8801710608387",                 // e.g. "+8801XXXXXXXXX" — shown in the contact section and footer when set
  CONTACT_EMAIL: "hello@datawavebd.com",
};

const $ = (s) => document.querySelector(s);

// theme toggle — choice is remembered in the browser for 7 days
const themeBtn = $("#themeBtn"), root = document.documentElement;
const syncThemeBtn = () => themeBtn.setAttribute("aria-label", root.dataset.theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
syncThemeBtn();
themeBtn.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  syncThemeBtn();
  try { localStorage.setItem("dw-theme", JSON.stringify({ v: next, exp: Date.now() + 7 * 864e5 })); } catch {}
});

// feature tabs
const tabs = [...document.querySelectorAll(".tab")];
const selectTab = (t, focus) => {
  tabs.forEach((x) => {
    const on = x === t;
    x.setAttribute("aria-selected", on);
    x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
  });
  if (focus) t.focus();
};
tabs.forEach((t, i) => {
  t.tabIndex = i ? -1 : 0;
  t.addEventListener("click", () => selectTab(t));
  t.addEventListener("keydown", (e) => {
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
  });
});

// mobile nav
const burger = $("#burger"), links = $("#navLinks");
burger.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => { if (e.target.tagName === "A") { links.classList.remove("open"); burger.setAttribute("aria-expanded", false); } });

if (CONFIG.CONTACT_PHONE) {
  const tel = $("#phoneLink");
  tel.href = "tel:" + CONFIG.CONTACT_PHONE.replace(/[^\d+]/g, "");
  tel.textContent = CONFIG.CONTACT_PHONE;
  $("#waFab").href = $("#waFab").dataset.h = "https://wa.me/" + CONFIG.CONTACT_PHONE.replace(/\D/g, "");
  $("#waFab").hidden = false;
  $("#waLink").href = "https://wa.me/" + CONFIG.CONTACT_PHONE.replace(/\D/g, "");
  $("#phoneRow").hidden = false;
}
$("#yr").textContent = new Date().getFullYear();
$("#mailLink").href = "mailto:" + CONFIG.CONTACT_EMAIL;
$("#mailLink").textContent = CONFIG.CONTACT_EMAIL;

// lead form
const form = $("#leadForm"), msg = $("#formMsg"), btn = $("#submitBtn");
const say = (text, cls) => { msg.textContent = text; msg.className = "form-msg " + (cls || ""); };

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (data._gotcha) return; // bot

  let valid = true;
  for (const f of ["name", "email", "organisation"]) {
    const bad = !data[f].trim() || (f === "email" && !/^\S+@\S+\.\S+$/.test(data[f]));
    form.elements[f].classList.toggle("bad", bad);
    if (bad) valid = false;
  }
  if (!valid) return say("Please fill in your name, a valid work email and organisation.", "err");

  delete data._gotcha;
  const endpoint = CONFIG.WEB3FORMS_KEY ? "https://api.web3forms.com/submit" : CONFIG.FORM_ENDPOINT;

  if (!endpoint) {
    const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
    location.href = `mailto:${CONFIG.CONTACT_EMAIL}?subject=${encodeURIComponent("DataWave enquiry — " + data.interest)}&body=${encodeURIComponent(body)}`;
    return say("Opening your email app — just press send. Thank you!", "ok");
  }

  btn.disabled = true; btn.textContent = "Sending…";
  try {
    const payload = CONFIG.WEB3FORMS_KEY
      ? { ...data, access_key: CONFIG.WEB3FORMS_KEY, subject: "DataWave enquiry — " + data.interest }
      : data;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    say("Thank you! We'll get back to you within one working day.", "ok");
  } catch {
    say(`Something went wrong. Please email us at ${CONFIG.CONTACT_EMAIL}.`, "err");
  } finally {
    btn.disabled = false; btn.textContent = "Send request";
  }
});

// highlight the nav link of the section in view
{
  const map = new Map([...links.querySelectorAll("a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const a = map.get(e.target.id);
    if (a && e.isIntersecting) { map.forEach((x) => x.classList.remove("active")); a.classList.add("active"); }
  }), { rootMargin: "-40% 0px -55% 0px" });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}
