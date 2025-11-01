import { renderAddMemberModal, showToast } from "./components.js";

export function renderView(store, view) {
  const totals = store.totals();
  const cur = store.settings.currency;

  const iconColor = "#0f172a";
  const actionIcons = {
    "add-member": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="${iconColor}" stroke-width="1.6"/><path d="M3 20c0-3 3-5 6-5" stroke="${iconColor}" stroke-width="1.6"/><path d="M17 8v6" stroke="${iconColor}" stroke-width="1.6"/><path d="M14 11h6" stroke="${iconColor}" stroke-width="1.6"/></svg>`,
    "daily-bazar": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6h14l-2 9H8L6 6Z" stroke="${iconColor}" stroke-width="1.6"/><circle cx="9" cy="19" r="2" fill="${iconColor}"/><circle cx="17" cy="19" r="2" fill="${iconColor}"/></svg>`,
    "meal-record": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 4v8a3 3 0 0 0 3 3h0V4" stroke="${iconColor}" stroke-width="1.6"/><path d="M17 4v11" stroke="${iconColor}" stroke-width="1.6"/><path d="M14 4v4" stroke="${iconColor}" stroke-width="1.6"/></svg>`,
    "bazar-list": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16" stroke="${iconColor}" stroke-width="1.6"/><path d="M4 12h16" stroke="${iconColor}" stroke-width="1.6"/><path d="M4 18h10" stroke="${iconColor}" stroke-width="1.6"/></svg>`,
    "monthly-bill": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="14" rx="2" stroke="${iconColor}" stroke-width="1.6"/><path d="M8 3v4M16 3v4" stroke="${iconColor}" stroke-width="1.6"/><path d="M8 11h8M8 15h5" stroke="${iconColor}" stroke-width="1.6"/></svg>`,
    "download-report": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4v8" stroke="${iconColor}" stroke-width="1.6"/><path d="M8 9l4 4 4-4" stroke="${iconColor}" stroke-width="1.6"/><path d="M5 20h14" stroke="${iconColor}" stroke-width="1.6"/></svg>`,
  };

  const dashboard = `
    <div class="grid">
      <div class="card"><h4>Total Member</h4><div class="value">${totals.totalMembers}</div></div>
      <div class="card"><h4>Total Bazar</h4><div class="value">${totals.totalBazar.toFixed(2)} ${cur}</div></div>
      <div class="card"><h4>Total Meals</h4><div class="value">${totals.totalMeals}</div></div>
      <div class="card"><h4>Per Meal Rate</h4><div class="value">${totals.perMeal.toFixed(2)} ${cur}</div></div>
    </div>
    <div class="card" style="margin-top:12px;">
      <h4>Each Member Balance</h4>
      <div class="list">
        ${totals.membersBalance
          .map(
            (m) => `<div class="list-item">
              <div><strong>${m.name}</strong><br/><small>Meals: ${m.meals} • Bazar: ${m.bazar.toFixed(2)} ${cur}</small></div>
              <div style="text-align:right;">
                <div style="font-weight:700; color:${m.balance>=0 ? '#16a34a' : '#dc2626'}">${m.balance>=0 ? 'Get' : 'Pay'} ${Math.abs(m.balance).toFixed(2)} ${cur}</div>
              </div>
            </div>`,
          )
          .join("") || `<div class="list-item">No member added</div>`}
      </div>
    </div>
    <div class="actions">
      <button class="action-btn" data-action="add-member" aria-label="Add Member">
        ${actionIcons["add-member"]}<span>Add Member</span>
      </button>
      <button class="action-btn" data-action="daily-bazar" aria-label="Daily Bazar">
        ${actionIcons["daily-bazar"]}<span>Daily Bazar</span>
      </button>
      <button class="action-btn" data-action="meal-record" aria-label="Meal Record">
        ${actionIcons["meal-record"]}<span>Meal Record</span>
      </button>
      <button class="action-btn" data-action="bazar-list" aria-label="Bazar List">
        ${actionIcons["bazar-list"]}<span>Bazar List</span>
      </button>
      <button class="action-btn" data-action="monthly-bill" aria-label="Monthly Bill">
        ${actionIcons["monthly-bill"]}<span>Monthly Bill</span>
      </button>
      <button class="action-btn" data-action="download-report" aria-label="Download Report">
        ${actionIcons["download-report"]}<span>Download Report</span>
      </button>
    </div>
  `;

  const member = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4>Members</h4>
        <button class="btn btn-primary" id="addMemberOpen">+ Add</button>
      </div>
      <div class="list" style="margin-top:8px;">
        ${store.members
          .map(
            (m) => `<div class="list-item">
              <div><strong>${m.name}</strong><br/><small>Joined: ${m.joinDate || "-"}</small></div>
              <div class="badge">Meals: ${m.meals}</div>
            </div>`,
          )
          .join("") || `<div class="list-item">Empty list</div>`}
      </div>
    </div>
  `;

  const bazar = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4>Bazar List</h4>
        <button class="btn btn-primary" id="addBazarOpen">+ Add</button>
      </div>
      <div class="row" style="grid-template-columns: 1fr 1fr;">
        <select class="select" id="bFilterMember">
          <option value="">All Member</option>
          ${store.members.map((m) => `<option value="${m.id}">${m.name}</option>`).join("")}
        </select>
        <input class="input" id="bFilterDate" type="date"/>
      </div>
      <div class="list" style="margin-top:8px;">
        ${store.bazar
          .filter((x) => {
            const fid = document.getElementById("bFilterMember")?.value || "";
            const fdt = document.getElementById("bFilterDate")?.value || "";
            return (!fid || x.memberId === fid) && (!fdt || x.date === fdt);
          })
          .map((x) => {
            const m = store.members.find((mm) => mm.id === x.memberId);
            return `<div class="list-item">
              <div><strong>${m?.name || "-"}</strong><br/><small>${x.date}</small></div>
              <div style="text-align:right;"><div>${x.amount.toFixed(2)} ${cur}</div><small>${x.note || ""}</small></div>
            </div>`;
          })
          .join("") || `<div class="list-item">No bazar added</div>`}
      </div>
    </div>
  `;

  const meal = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4>Meal Days Record</h4>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-secondary" id="d30">30 Days</button>
          <button class="btn btn-secondary" id="d60">60 Days</button>
          <button class="btn btn-secondary" id="dCustom">Custom</button>
        </div>
      </div>
      <div class="list" style="margin-top:8px;">
        ${store.members
          .map(
            (m) => `<div class="list-item">
              <div><strong>${m.name}</strong><br/><small>Days: ${store.settings.mealPeriodDays}</small></div>
              <div style="display:flex; align-items:center; gap:8px;">
                <button class="btn btn-secondary" data-mid="${m.id}" data-op="dec">–</button>
                <div class="badge">Meals: ${m.meals}</div>
                <button class="btn btn-primary" data-mid="${m.id}" data-op="inc">+</button>
              </div>
            </div>`,
          )
          .join("") || `<div class="list-item">No member</div>`}
      </div>
      <div style="margin-top:10px;">Auto Total: <strong>${store.members.reduce((s, m) => s + (m.meals || 0), 0)}</strong> meals</div>
    </div>
    <script>
      // placeholder
    </script>
  `;

  const settings = `
    <div class="card">
      <h4>Settings</h4>
      <div class="row">
        <label>Currency</label>
        <select class="select" id="setCurrency">
          ${["SAR","BDT","INR"].map(c => `<option ${cur===c?'selected':''}>${c}</option>`).join("")}
        </select>
        <label>Language</label>
        <select class="select" id="setLang">
          <option value="phonetic" ${store.settings.lang==='phonetic'?'selected':''}>Phonetic English</option>
          <option value="bangla" ${store.settings.lang==='bangla'?'selected':''}>বাংলা</option>
        </select>
        <label>Theme</label>
        <select class="select" id="setTheme">
          <option value="light" ${store.settings.theme==='light'?'selected':''}>Light</option>
          <option value="dark" ${store.settings.theme==='dark'?'selected':''}>Dark</option>
        </select>
        <label>Meal Period Days</label>
        <input class="input" id="setDays" type="number" value="${store.settings.mealPeriodDays}" />
        <button class="btn btn-primary" id="saveSettings">Save</button>
      </div>
    </div>
  `;

  const byView = { home: dashboard, member, bazar, meal, settings };
  setTimeout(() => wireInteractions(store, view), 0);
  return byView[view] || dashboard;
}

function wireInteractions(store, view) {
  if (view === "meal") {
    document.getElementById("d30")?.addEventListener("click", () => store.setSettings({ mealPeriodDays: 30 }));
    document.getElementById("d60")?.addEventListener("click", () => store.setSettings({ mealPeriodDays: 60 }));
    document.getElementById("dCustom")?.addEventListener("click", () => {
      const v = prompt("Custom Days:", store.settings.mealPeriodDays);
      if (v) store.setSettings({ mealPeriodDays: Number(v) });
    });
    document.querySelectorAll("[data-op]").forEach((b) =>
      b.addEventListener("click", () => {
        const delta = b.dataset.op === "inc" ? 1 : -1;
        store.adjustMeals(b.dataset.mid, delta);
        location.reload();
      }),
    );
  }
  if (view === "settings") {
    document.getElementById("saveSettings")?.addEventListener("click", () => {
      store.setSettings({
        currency: document.getElementById("setCurrency").value,
        lang: document.getElementById("setLang").value,
        theme: document.getElementById("setTheme").value,
        mealPeriodDays: Number(document.getElementById("setDays").value || 30),
      });
      location.reload();
    });
  }
  if (view === "member") {
    document.getElementById("addMemberOpen")?.addEventListener("click", () =>
      renderAddMemberModal(store, showToast),
    );
  }
}