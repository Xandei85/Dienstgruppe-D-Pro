const app = document.getElementById("app");
const now = new Date();

function renderStart() {
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Date(2023, i, 1).toLocaleString("de", { month: "long" })
  );

  app.innerHTML = `
    <div class="card">
      <h1>Dienstgruppe D – PRO</h1>
      <div class="small">V2 (Testumgebung) – Live bleibt unberührt.</div>
      <hr style="border:none;border-top:1px solid #eee;margin:14px 0;">
      <div class="row">
        <label>Monat:
          <select id="m"></select>
        </label>
        <label>Jahr:
          <select id="y"></select>
        </label>
        <button id="open">Öffnen</button>
      </div>
    </div>
  `;

  const mSel = document.getElementById("m");
  monthNames.forEach((t, i) => {
    const opt = document.createElement("option");
    opt.value = String(i + 1);
    opt.textContent = t;
    mSel.appendChild(opt);
  });

  const ySel = document.getElementById("y");
  const start = 2026, end = 2030;
  for (let y = start; y <= end; y++) {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = String(y);
    ySel.appendChild(opt);
  }

  mSel.value = String(now.getMonth() + 1);
  ySel.value = String(now.getFullYear());

  document.getElementById("open").onclick = () => {
    const m = mSel.value;
    const y = ySel.value;
    location.hash = `#/month/${y}/${m}`;
    render();
  };
}

function renderMonth(y, m) {
  app.innerHTML = `
    <div class="row" style="margin-bottom:12px">
      <button id="back">← Start</button>
      <div class="small">Monat: ${m}.${y} (Platzhalter – kommt als nächstes)</div>
    </div>
    <div class="card">
      <h1>Monatsansicht</h1>
      <div class="small">Als nächstes hängen wir hier Mitarbeiter + Grid + Buttons an.</div>
    </div>
  `;
  document.getElementById("back").onclick = () => {
    location.hash = "#/";
    render();
  };
}

function render() {
  const h = location.hash || "#/";
  const m = h.match(/^#\/month\/(\d{4})\/(\d{1,2})$/);
  if (m) return renderMonth(m[1], m[2]);
  return renderStart();
}

window.addEventListener("hashchange", render);
render();
