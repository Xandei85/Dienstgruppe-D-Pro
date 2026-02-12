/* Dienstgruppe D – PRO Final Demo
   Ziel: nur Design + Kernlogik (Gelb/Weiß + Ferien BY grün + Codes in Zellen)
   Speichern: localStorage (damit du es sofort anschauen kannst, ohne Server)
*/
(() => {
  const CFG = window.APP_CONFIG || {};
  const PROJECT = (CFG.PROJECT_NAME || "Dienstgruppe D").trim();

  const YEAR_START = Number(CFG.YEAR_START || 2026);
  const YEAR_END   = Number(CFG.YEAR_END   || 2032);

  const START_PATTERN_DATE = CFG.START_PATTERN_DATE || "2026-01-02";
  const PATTERN_SHIFT = Number(CFG.PATTERN_SHIFT || 0);

  const LS = {
    employees: PROJECT + "::employees",
    me:        PROJECT + "::me",
    notes:     (y,m)=> PROJECT + `::notes::${y}-${m}`,
    marks:     (y,m)=> PROJECT + `::marks::${y}-${m}` // { "Name|YYYY-MM-DD": {code,cls} }
  };

  // ---------- Helpers ----------
  const $ = (id) => document.getElementById(id);
  const pad2 = (n) => String(n).padStart(2,"0");
  const iso = (d) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

  function daysInMonth(year, month){ return new Date(year, month, 0).getDate(); }
  function weekday(date){ return date.getDay(); } // 0=So..6=Sa

  // Ferien-Logik aus deiner Originaldatei (Demo, unverändert übernommen)
  function isFerien(date){
    const m = date.getMonth() + 1;
    const d = date.getDate();
    if (m === 1 && d <= 5) return true;
    if (m === 2 && d >= 16 && d <= 20) return true;
    if ((m === 3 && d >= 30) || (m === 4 && d <= 10)) return true;
    if (m === 6 && d >= 2 && d <= 5) return true;
    if ((m === 8 && d >= 3) || (m === 9 && d <= 14)) return true;
    if (m === 11 && d >= 2 && d <= 6) return true;
    if (m === 12 && d >= 23) return true;
    return false;
  }

  function daysBetween(date1, date2){
    const t1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const t2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((t2 - t1) / 86400000);
  }
  function isYellowDay(date){
    const start = new Date(START_PATTERN_DATE);
    const diff = daysBetween(start, date) + PATTERN_SHIFT;
    const mod = ((diff % 4) + 4) % 4;
    return mod === 0 || mod === 1; // 2 Tage Gelb
  }

  // ---------- State ----------
  const MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const CODES = Array.isArray(CFG.CODES) ? CFG.CODES : [];

  let employees = loadEmployees();
  let me = localStorage.getItem(LS.me) || employees[0] || "";
  let currentYear = clampYear(new Date().getFullYear());
  let currentMonth = new Date().getMonth() + 1;
  let selectedCode = null; // {code, cls}

  function clampYear(y){
    y = Number(y);
    if (!Number.isFinite(y)) y = YEAR_START;
    return Math.max(YEAR_START, Math.min(YEAR_END, y));
  }

  function loadEmployees(){
    try{
      const raw = localStorage.getItem(LS.employees);
      if (raw){
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    }catch{}
    return (CFG.EMPLOYEES_DEFAULT || ["Wiesent","Puhl","Botzenhard","Sommer","Schmid"]).slice();
  }
  function saveEmployees(){
    localStorage.setItem(LS.employees, JSON.stringify(employees));
  }

  function loadMarks(year, month){
    try{
      const raw = localStorage.getItem(LS.marks(year,month));
      if (raw) return JSON.parse(raw) || {};
    }catch{}
    return {};
  }
  function saveMarks(year, month, marks){
    localStorage.setItem(LS.marks(year,month), JSON.stringify(marks));
  }

  // ---------- UI init ----------
  function init(){
    // selects
    const meSelect = $("meSelect");
    const monthSelect = $("monthSelect");
    const yearSelect = $("yearSelect");

    renderMeSelect();
    meSelect.value = me;
    meSelect.addEventListener("change", () => {
      me = meSelect.value;
      localStorage.setItem(LS.me, me);
      renderGrid();
    });

    MONTHS.forEach((m,i)=>{
      const o = document.createElement("option");
      o.value = String(i+1);
      o.textContent = m;
      monthSelect.appendChild(o);
    });
    monthSelect.value = String(currentMonth);
    monthSelect.addEventListener("change", () => {
      currentMonth = Number(monthSelect.value);
      renderGrid();
    });

    for(let y=YEAR_START; y<=YEAR_END; y++){
      const o = document.createElement("option");
      o.value = String(y);
      o.textContent = String(y);
      yearSelect.appendChild(o);
    }
    yearSelect.value = String(currentYear);
    yearSelect.addEventListener("change", () => {
      currentYear = clampYear(yearSelect.value);
      yearSelect.value = String(currentYear);
      renderGrid();
    });

    $("prevMonth").addEventListener("click", () => shiftMonth(-1));
    $("nextMonth").addEventListener("click", () => shiftMonth(+1));

    // code buttons
    const wrap = $("codeButtons");
    wrap.innerHTML = "";
    CODES.forEach(item => {
      const b = document.createElement("button");
      b.className = "codeBtn";
      b.type = "button";
      b.textContent = item.code;
      b.addEventListener("click", () => {
        // toggle selection
        if (selectedCode && selectedCode.code === item.code){
          selectedCode = null;
          [...wrap.querySelectorAll(".codeBtn")].forEach(x=>x.classList.remove("active"));
        } else {
          selectedCode = {code:item.code, cls:item.cls};
          [...wrap.querySelectorAll(".codeBtn")].forEach(x=>x.classList.remove("active"));
          b.classList.add("active");
        }
      });
      wrap.appendChild(b);
    });
    $("btnClearCode").addEventListener("click", () => {
      selectedCode = null;
      [...wrap.querySelectorAll(".codeBtn")].forEach(x=>x.classList.remove("active"));
    });

    // notes
    const notes = $("monthNotes");
    notes.value = localStorage.getItem(LS.notes(currentYear,currentMonth)) || "";
    notes.addEventListener("input", () => {
      localStorage.setItem(LS.notes(currentYear,currentMonth), notes.value);
    });

    // modals
    $("btnEmployees").addEventListener("click", openEmployees);
    $("closeEmployees").addEventListener("click", closeEmployees);
    $("btnHelp").addEventListener("click", openHelp);
    $("closeHelp").addEventListener("click", closeHelp);
    $("modalBackdrop").addEventListener("click", () => { closeEmployees(); closeHelp(); });

    $("empAddBtn").addEventListener("click", () => {
      const inp = $("empNewName");
      const name = (inp.value || "").trim();
      if (!name) return;
      if (employees.includes(name)) { inp.value=""; return; }
      employees.push(name);
      saveEmployees();
      inp.value="";
      renderMeSelect();
      renderEmployeesList();
      renderGrid();
    });

    $("btnExport").addEventListener("click", () => {
      alert("Export ist in dieser Demo nur Optik. In der PRO-Version kommt PDF/Excel-Export.");
    });

    renderGrid();
  }

  function renderMeSelect(){
    const meSelect = $("meSelect");
    meSelect.innerHTML = "";
    employees.forEach(n=>{
      const o = document.createElement("option");
      o.value = n;
      o.textContent = n;
      meSelect.appendChild(o);
    });
    if (!employees.includes(me)){
      me = employees[0] || "";
      localStorage.setItem(LS.me, me);
    }
    meSelect.value = me;
  }

  function shiftMonth(delta){
    let m = currentMonth + delta;
    let y = currentYear;
    if (m < 1){ m = 12; y -= 1; }
    if (m > 12){ m = 1; y += 1; }
    y = clampYear(y);
    currentYear = y;
    currentMonth = m;
    $("monthSelect").value = String(m);
    $("yearSelect").value = String(y);
    // notes refresh
    $("monthNotes").value = localStorage.getItem(LS.notes(currentYear,currentMonth)) || "";
    renderGrid();
  }

  // ---------- Grid ----------
  function renderGrid(){
    const year = currentYear;
    const month = currentMonth;

    $("gridTitle").textContent = `Monatsansicht – ${MONTHS[month-1]} ${year}`;
    $("gridMeta").textContent = `2/2-Rhythmus ab ${START_PATTERN_DATE} • Ferien (BY) grün • Ohne Server`;

    // refresh notes
    $("monthNotes").value = localStorage.getItem(LS.notes(year,month)) || "";

    const marks = loadMarks(year,month);

    const dim = daysInMonth(year,month);
    const table = document.createElement("table");

    // head
    const thead = document.createElement("thead");
    const hr = document.createElement("tr");

    const thName = document.createElement("th");
    thName.textContent = "Name";
    thName.className = "nameHead";
    hr.appendChild(thName);

    for(let d=1; d<=dim; d++){
      const date = new Date(year, month-1, d);
      const wd = weekday(date);

      const th = document.createElement("th");
      th.className = "dayCell";
      if (wd === 6) th.classList.add("sat");
      if (wd === 0) th.classList.add("sun");
      if (isFerien(date)) th.classList.add("holiday");

      th.innerHTML = `<span class="num">${d}</span>`;
      hr.appendChild(th);
    }
    thead.appendChild(hr);
    table.appendChild(thead);

    // body
    const tbody = document.createElement("tbody");
    employees.forEach(name=>{
      const tr = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.className = "nameCell";
      tdName.textContent = name;
      tr.appendChild(tdName);

      for(let d=1; d<=dim; d++){
        const date = new Date(year, month-1, d);
        const key = `${name}|${iso(date)}`;

        const td = document.createElement("td");

        // base pattern color (yellow/white)
        if (isYellowDay(date)) td.classList.add("baseYellow");
        else td.classList.add("baseWhite");

        // saved mark
        const m = marks[key];
        if (m && m.code){
          td.textContent = m.code;
          if (m.cls) td.classList.add(m.cls);
        }

        // highlight row for "Ich bin"
        if (name === me) td.classList.add("userHighlight");

        td.addEventListener("click", () => {
          // apply code if selected, otherwise toggle quick-yellow demo
          if (selectedCode){
            td.textContent = selectedCode.code;
            // remove previous mark classes
            td.className = td.className.replace(/\bmark\w+\b/g, "").trim();
            td.classList.add(selectedCode.cls);

            marks[key] = {code:selectedCode.code, cls:selectedCode.cls};
            saveMarks(year,month,marks);
          } else {
            // quick toggle: emphasize yellow
            td.classList.toggle("baseYellow");
          }
        });

        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    const scroller = $("gridScroller");
    const prevLeft = scroller.scrollLeft;
    const prevTop  = scroller.scrollTop;

    scroller.innerHTML = "";
    scroller.appendChild(table);

    scroller.scrollLeft = prevLeft;
    scroller.scrollTop  = prevTop;
  }

  // ---------- Employees modal ----------
  function openEmployees(){
    $("modalBackdrop").hidden = false;
    $("employeesModal").hidden = false;
    renderEmployeesList();
    setTimeout(()=> $("empNewName").focus(), 50);
  }
  function closeEmployees(){
    $("employeesModal").hidden = true;
    // keep backdrop if another modal is open
    if ($("helpModal").hidden) $("modalBackdrop").hidden = true;
  }
  function renderEmployeesList(){
    const list = $("empList");
    list.innerHTML = "";
    employees.forEach(n=>{
      const row = document.createElement("div");
      row.className = "empItem";
      row.innerHTML = `<div class="empName">${escapeHtml(n)}</div>`;
      const btn = document.createElement("button");
      btn.className = "btn small ghost";
      btn.type = "button";
      btn.textContent = "Entfernen";
      btn.addEventListener("click", () => {
        employees = employees.filter(x=>x!==n);
        if (!employees.length) employees = ["Mitarbeiter 1"];
        saveEmployees();
        renderMeSelect();
        renderEmployeesList();
        renderGrid();
      });
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  // ---------- Help modal ----------
  function openHelp(){
    $("modalBackdrop").hidden = false;
    $("helpModal").hidden = false;
  }
  function closeHelp(){
    $("helpModal").hidden = true;
    if ($("employeesModal").hidden) $("modalBackdrop").hidden = true;
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  // go
  document.addEventListener("DOMContentLoaded", init);
})();
