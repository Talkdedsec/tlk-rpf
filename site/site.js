// Dil seçimi (varsayılan İngilizce, Türkçe düğmeyle), ekran görüntüsü büyütme ve son sürümün indirme bağlantısı.
(() => {
  const kok = document.documentElement;
  const basliklar = { en: "tlk-rpf — FiveM RPF editor", tr: "tlk-rpf — FiveM RPF düzenleyici" };

  const dilAyarla = (dil, kaydet) => {
    kok.dataset.dil = dil;
    kok.lang = dil;
    document.title = basliklar[dil];
    if (!kaydet) return;
    try {
      localStorage.setItem("dil", dil);
    } catch {
      /* depolama kapalıysa tercih hatırlanmaz */
    }
  };
  let kayitli = null;
  try {
    kayitli = localStorage.getItem("dil");
  } catch {
    /* yok say */
  }
  dilAyarla(kayitli === "tr" ? "tr" : "en", false);
  document.getElementById("dil").addEventListener("click", () => dilAyarla(kok.dataset.dil === "tr" ? "en" : "tr", true));

  const pencere = document.getElementById("buyuk");
  const buyukResim = pencere.querySelector("img");
  document.querySelectorAll(".buyut").forEach((d) =>
    d.addEventListener("click", () => {
      buyukResim.src = d.dataset.src;
      buyukResim.alt = d.querySelector("img")?.alt ?? "";
      pencere.showModal();
    }),
  );
  pencere.addEventListener("click", (e) => {
    if (e.target === pencere) pencere.close();
  });

  // Son sürümde kurucu varsa doğrudan ona bağla; yoksa sürümler sayfası kalır.
  const boyut = (b) => (b / 1048576).toFixed(1).replace(".", kok.dataset.dil === "tr" ? "," : ".") + " MB";
  fetch("https://api.github.com/repos/Talkdedsec/tlk-rpf/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((s) => {
      const kurucu = (s.assets || []).find((a) => /_x64-setup\.exe$/i.test(a.name));
      if (!kurucu) return;
      document.getElementById("indir").href = kurucu.browser_download_url;
      const bilgi = document.getElementById("surum-bilgi");
      const surum = String(s.tag_name || "").replace(/^v/, "");
      bilgi.querySelector(".tr").textContent = `Sürüm ${surum} · ${boyut(kurucu.size)} · Windows 10/11 x64 · yönetici izni gerekmez`;
      bilgi.querySelector(".en").textContent = `Version ${surum} · ${boyut(kurucu.size)} · Windows 10/11 x64 · no admin rights needed`;
    })
    .catch(() => {});
})();

// Doku yeniden renklendirme demosu: örnek dokuyu çizer, filtreyi uygular, kaydetmede yedek satırını gösterir.
(() => {
  const tuval = document.getElementById("doku");
  if (!tuval) return;
  const ctx = tuval.getContext("2d");
  const kaynak = document.createElement("canvas");
  kaynak.width = kaynak.height = 512;
  const k = kaynak.getContext("2d");
  // tohumlu rastgele: her açılışta aynı leke
  let t = 7;
  const r = () => ((t = (t * 16807) % 2147483647) / 2147483647);
  // metaball leke: bulanık daireler eşiklenince birbirine akan sıvı kenarı verir
  k.filter = 'blur(7px)';
  k.fillStyle = '#000';
  const leke = (x, y, s) => { k.beginPath(); k.arc(x, y, s, 0, Math.PI * 2); k.fill(); };
  leke(256, 250, 105);
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = 60 + r() * 140;
    leke(256 + Math.cos(a) * d, 250 + Math.sin(a) * d, 12 + r() * 36);
    leke(256 + Math.cos(a) * d * 0.7, 250 + Math.sin(a) * d * 0.7, 8 + r() * 14);
  }
  for (let i = 0; i < 80; i++) {
    const a = r() * Math.PI * 2, d = 150 + r() * 95;
    leke(256 + Math.cos(a) * d, 250 + Math.sin(a) * d, 3 + r() * 7);
  }
  k.filter = 'none';
  const im = k.getImageData(0, 0, 512, 512), p = im.data;
  for (let i = 0; i < p.length; i += 4) {
    const al = p[i + 3];
    if (al < 120) { p[i + 3] = 0; continue; }
    const kenar = Math.min(1, (al - 120) / 110), y = (i / 4 / 512) | 0, x = (i / 4) % 512;
    const parilti = Math.max(0, 1 - Math.hypot(x - 215, (y - 195) * 1.8) / 90) * 60 * kenar;
    p[i] = 95 + 85 * kenar + parilti; p[i + 1] = 4 + 8 * kenar + parilti * 0.5; p[i + 2] = 10 + 10 * kenar + parilti * 0.5; p[i + 3] = 255;
  }
  k.putImageData(im, 0, 0);

  const ton = document.getElementById("r-ton"), doy = document.getElementById("r-doy"), par = document.getElementById("r-par");
  const ciz = () => {
    ctx.clearRect(0, 0, 512, 512);
    ctx.filter = `hue-rotate(${ton.value}deg) saturate(${doy.value}%) brightness(${par.value}%)`;
    ctx.drawImage(kaynak, 0, 0);
    ctx.filter = "none";
    ton.nextElementSibling.textContent = ton.value + "°";
    doy.nextElementSibling.textContent = doy.value + "%";
    par.nextElementSibling.textContent = par.value + "%";
  };
  [ton, doy, par].forEach((g) => g.addEventListener("input", ciz));
  document.querySelectorAll(".hazir button").forEach((b) =>
    b.addEventListener("click", () => {
      [ton.value, doy.value, par.value] = b.dataset.h.split(",");
      ciz();
    }),
  );
  ciz();

  const kayit = document.getElementById("kayit"), fivem = document.getElementById("fivem");
  const tr = () => document.documentElement.dataset.dil === "tr";
  const kaydet = () => {
    kayit.classList.add("acik");
    if (fivem.checked) {
      kayit.className = "kayit acik kotu";
      kayit.textContent = tr()
        ? "Yazılmadı: FiveM bu dosyayı açık tutuyor. FiveM'i kapat, sonra kaydet."
        : "Not written: FiveM has this file open. Close FiveM, then save.";
      return;
    }
    const d = new Date(), p = (n) => String(n).padStart(2, "0");
    const ad = `kill-effect.rpf.${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}.bak`;
    kayit.className = "kayit acik iyi";
    kayit.textContent = tr()
      ? `Kaydedildi. Önceki dosya → yedekler/${ad} (son 20 tutulur)`
      : `Saved. Previous file → backups/${ad} (last 20 kept)`;
  };
  document.getElementById("kaydet").addEventListener("click", kaydet);
  let gorunur = false;
  new IntersectionObserver(([e]) => (gorunur = e.isIntersecting)).observe(tuval);
  // Ctrl+S yalnızca demo ekrandayken yakalanır; başka yerde tarayıcının kendi kaydetmesi kalır
  addEventListener("keydown", (e) => {
    if (gorunur && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      kaydet();
    }
  });
})();
