/* ============================================================
   Spotless Mobile Detailing — site config
   Fill these in and every phone/email/booking button on the site
   updates automatically.
   ============================================================ */
const SPOTLESS = {
  phone: "",            // e.g. "(775) 555-0123"  — shows Call/Text buttons when set
  email: "",            // quote + car club requests are emailed here (via FormSubmit) when set
  instagram: "https://www.instagram.com/spotlessdetails__/",
  instagramDM: "https://ig.me/m/spotlessdetails__",
  googleReviews: "https://www.google.com/search?q=Spotless+Mobile+Detailing+Reno+reviews",
};

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const digits = SPOTLESS.phone.replace(/\D/g, "");

  /* phone / email wiring */
  $$("[data-phone]").forEach((el) => {
    if (!digits) { el.hidden = true; return; }
    const sms = el.dataset.phone === "sms";
    el.href = (sms ? "sms:" : "tel:") + "+1" + digits.slice(-10);
    const t = el.querySelector("[data-phone-text]");
    if (t) t.textContent = SPOTLESS.phone;
  });
  $$("[data-phone-fallback]").forEach((el) => { if (digits) el.hidden = true; });
  $$("[data-email]").forEach((el) => {
    if (!SPOTLESS.email) { el.hidden = true; return; }
    el.href = "mailto:" + SPOTLESS.email;
    const t = el.querySelector("[data-email-text]");
    if (t) t.textContent = SPOTLESS.email;
  });
  $$("[data-ig]").forEach((el) => (el.href = SPOTLESS.instagram));
  $$("[data-reviews]").forEach((el) => (el.href = SPOTLESS.googleReviews));

  /* mobile menu */
  const burger = $(".burger");
  burger && burger.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
  });
  $$(".dd > button").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      const dd = b.parentElement;
      const open = dd.classList.toggle("open");
      b.setAttribute("aria-expanded", open);
    })
  );
  document.addEventListener("click", (e) => {
    $$(".dd.open").forEach((dd) => { if (!dd.contains(e.target) && window.innerWidth > 900) dd.classList.remove("open"); });
  });
  $$(".nav a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("menu-open")));

  /* reveal on scroll */
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  $$(".rv").forEach((el) => io.observe(el));

  /* autoplay muted loops only while visible */
  const vio = new IntersectionObserver((ents) => ents.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting) {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      const p = v.play(); p && p.catch(() => {});
    } else v.pause();
  }), { rootMargin: "120px" });
  $$("video[data-auto]").forEach((v) => { v.muted = true; v.playsInline = true; vio.observe(v); });

  /* pricing tabs */
  $$("[role=tablist]").forEach((list) => {
    const tabs = $$("[role=tab]", list);
    tabs.forEach((t) => t.addEventListener("click", () => {
      tabs.forEach((x) => { x.setAttribute("aria-selected", x === t); $("#" + x.getAttribute("aria-controls")).hidden = x !== t; });
    }));
  });

  /* "what does my car need?" matcher */
  const out = $("#match-out");
  $$(".chip[data-svc]").forEach((c) => c.addEventListener("click", () => {
    $$(".chip[data-svc]").forEach((x) => x.setAttribute("aria-pressed", x === c));
    out.innerHTML = `<div class="k">We'd recommend</div><h3 class="chrome">${c.dataset.svc}</h3>
      <p class="lead" style="font-size:16px">${c.dataset.why}</p>
      <div class="svc-acts" style="margin-top:22px">
        <a class="btn btn-p" href="/contact?service=${encodeURIComponent(c.dataset.pick)}">Get a free quote</a>
        <a class="btn btn-g" href="${c.dataset.link}">See details</a></div>`;
  }));

  /* condition slider */
  const rng = $("#condition");
  if (rng) {
    const lab = $("#condition-val");
    const f = () => { const v = +rng.value; lab.textContent = v + "/10 · " + (v <= 4 ? "Light" : v <= 7 ? "Moderate" : "Heavy"); };
    rng.addEventListener("input", f); f();
  }

  /* prefill service from ?service= */
  const q = new URLSearchParams(location.search).get("service");
  const sel = $("#service");
  if (q && sel) { [...sel.options].forEach((o) => { if (o.value === q || o.text === q) sel.value = o.value; }); }

  /* forms */
  $$("form[data-lead]").forEach((form) => form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $(".form-msg", form);
    const btn = $("button[type=submit]", form);
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    data._subject = form.dataset.lead + " — " + (data.name || "Website");
    btn.disabled = true; const label = btn.textContent; btn.textContent = "Sending…";
    try {
      if (SPOTLESS.email) {
        const r = await fetch("https://formsubmit.co/ajax/" + SPOTLESS.email, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...data, _template: "table", _captcha: "false" }),
        });
        if (!r.ok) throw 0;
        msg.className = "form-msg ok";
        msg.textContent = "Got it, " + (data.name || "thanks") + "! We'll reach out shortly with your quote.";
        form.reset();
      } else {
        const text = Object.entries(data).filter(([k, v]) => v && !k.startsWith("_")).map(([k, v]) => k.replace(/_/g, " ") + ": " + v).join("\n");
        try { await navigator.clipboard.writeText(form.dataset.lead + "\n" + text); } catch (_) {}
        msg.className = "form-msg ok";
        msg.innerHTML = "Your request is copied. Paste it into our Instagram DM and we'll reply with your quote. <a href='" + SPOTLESS.instagramDM + "' target='_blank' rel='noopener' style='text-decoration:underline'>Open Instagram DM →</a>";
        window.open(SPOTLESS.instagramDM, "_blank", "noopener");
      }
    } catch (_) {
      msg.className = "form-msg err";
      msg.textContent = "Something went wrong sending that. Please message us on Instagram @spotlessdetails__.";
    }
    btn.disabled = false; btn.textContent = label;
  }));

  const y = $("#yr"); if (y) y.textContent = new Date().getFullYear();
})();
