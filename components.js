import QRCode from "qrcode";

export function showToast(msg = "Data Successfully Added ✅") {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

export function showEyeModal(store) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.placeItems = "center";
  modal.style.paddingTop = "0";
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-title">👁️ Quick Options</div>
      <div class="row">
        <button class="btn btn-primary" id="helpBtn">Help Line</button>
        <button class="btn btn-secondary" id="shareBtn">Share This App</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  document.getElementById("helpBtn").onclick = () => {
    window.open("https://zunaidhosse.github.io/My-contact/", "_blank");
  };
  document.getElementById("shareBtn").onclick = async () => {
    // show QR
    const card = modal.querySelector(".modal-card");
    const link = "https://zunaidhosse.github.io/Room-Bazar-Khawa-Hisab/";
    const qrWrap = document.createElement("div");
    qrWrap.className = "row";
    qrWrap.innerHTML = `<canvas id="qrCanvas"></canvas>
      <button class="btn btn-primary" id="copyLinkBtn">Scan QR or Copy Link</button>`;
    card.appendChild(qrWrap);
    await QRCode.toCanvas(document.getElementById("qrCanvas"), link, { width: 220 });
    document.getElementById("copyLinkBtn").onclick = async () => {
      try { await navigator.clipboard.writeText(link); showToast("Link Copied ✅"); } catch {}
    };
  };
}

export function showInstallPrompt({ onInstall, onLater }) {
  const modal = baseModal("Install Room Bazar & Khawa Hisab App", `
    <p style="margin:0 0 8px;">Install Room Bazar & Khawa Hisab App</p>
    <div style="display:flex; gap:8px;">
      <button class="btn btn-primary" id="installNow">Install Now</button>
      <button class="btn btn-secondary" id="installLater">Later</button>
    </div>
  `);
  document.getElementById("installNow").onclick = () => { onInstall?.(); modal.remove(); };
  document.getElementById("installLater").onclick = () => { onLater?.(); modal.remove(); };
}

export function showMenuDropdown(store, event, mount, toast) {
  const existing = document.getElementById("menuDropdown");
  if (existing) existing.remove();

  // Prevent the initial click from triggering outside-close
  event?.stopPropagation?.();

  const dd = document.createElement("div");
  dd.className = "dropdown";
  dd.id = "menuDropdown";
  dd.innerHTML = `
    <button id="addMemberOpen">1️⃣ Add Member</button>
    <button id="dailyBazarOpen">2️⃣ Daily Bazar Hisab</button>
    <button id="mealRecordOpen">3️⃣ Meal Days Record</button>
    <button id="bazarListOpen">4️⃣ Bazar List</button>
    <button id="monthlyBillOpen">5️⃣ Monthly Bill</button>
    <button id="downloadReportOpen">6️⃣ Download Report</button>
    <button id="resetAllOpen">7️⃣ Reset All Data</button>
  `;
  document.body.appendChild(dd);

  // Prevent clicks inside dropdown from bubbling to document
  dd.addEventListener("click", (e) => e.stopPropagation());

  // Position near the menu button
  const btn = event?.currentTarget || event?.target || document.getElementById("menuBtn");
  const rect = btn?.getBoundingClientRect?.();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const ddWidth = Math.min(vw * 0.92, 360);
  const margin = 8;

  let left = rect ? rect.left + rect.width - ddWidth : vw - ddWidth - 12;
  let top = rect ? rect.bottom + margin : 56;

  // Clamp within viewport
  left = Math.max(margin, Math.min(left, vw - ddWidth - margin));
  top = Math.max(margin, Math.min(top, vh - 240)); // keep on screen

  dd.style.position = "fixed";
  dd.style.left = `${left}px`;
  dd.style.top = `${top}px`;
  dd.style.zIndex = "50";
  dd.style.width = `${ddWidth}px`;

  const openModal = (id) => {
    switch (id) {
      case "addMemberOpen": renderAddMemberModal(store, toast); break;
      case "dailyBazarOpen": renderAddBazarModal(store, toast); break;
      case "mealRecordOpen": mount("meal"); break;
      case "bazarListOpen": mount("bazar"); break;
      case "monthlyBillOpen": renderMonthlyBillModal(store, toast); break;
      case "downloadReportOpen":
        import("./report.js").then((m) => m.generateReportPNG(store));
        break;
      case "resetAllOpen":
        renderResetModal(store, mount);
        break;
    }
    // Close after selection
    dd.remove();
    document.removeEventListener("click", onDocClick, true);
  };
  dd.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => openModal(b.id)));

  // Outside click to close (capture to ensure it runs before other handlers)
  const onDocClick = (e) => {
    const target = e.target;
    if (!dd.contains(target) && target?.id !== "menuBtn") {
      dd.remove();
      document.removeEventListener("click", onDocClick, true);
    }
  };
  document.addEventListener("click", onDocClick, true);
}

export function renderAddMemberModal(store, toast) {
  const modal = baseModal("Add Member", `
    <input class="input" id="mName" placeholder="Member Name (Banglish)"/>
    <input class="input" id="mJoin" type="date" placeholder="Join Date (Optional)"/>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button class="btn btn-secondary" id="cancel">Cancel</button>
      <button class="btn btn-primary" id="save">Save</button>
    </div>
  `);
  document.getElementById("save").onclick = () => {
    const name = document.getElementById("mName").value.trim();
    const jd = document.getElementById("mJoin").value;
    if (!name) return;
    store.addMember(name, jd);
    toast("Data Successfully Added ✅");
    modal.remove();
  };
  document.getElementById("cancel").onclick = () => modal.remove();
}

export function renderAddBazarModal(store, toast) {
  const opts = store.members.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
  const modal = baseModal("Daily Bazar Hisab", `
    <select class="select" id="bMember"><option value="">Select Member</option>${opts}</select>
    <input class="input" id="bAmount" type="number" inputmode="decimal" placeholder="Amount (${store.settings.currency})"/>
    <input class="input" id="bNote" placeholder="Description (Optional)"/>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button class="btn btn-secondary" id="cancel">Cancel</button>
      <button class="btn btn-primary" id="save">Save</button>
    </div>
  `);
  document.getElementById("save").onclick = () => {
    const id = document.getElementById("bMember").value;
    const amt = document.getElementById("bAmount").value;
    const note = document.getElementById("bNote").value;
    if (!id || !amt) return;
    store.addBazar(id, amt, note);
    toast("Data Successfully Added ✅");
    modal.remove();
  };
  document.getElementById("cancel").onclick = () => modal.remove();
}

export function renderMonthlyBillModal(store, toast) {
  const modal = baseModal("Monthly Bill", `
    <input class="input" id="water" type="number" inputmode="decimal" placeholder="Water Bill (${store.settings.currency})"/>
    <input class="input" id="electricity" type="number" inputmode="decimal" placeholder="Current Electricity Bill (${store.settings.currency})"/>
    <input class="input" id="avg6m" type="number" inputmode="decimal" placeholder="6 Masher Avg. Bill (Optional)"/>
    <input class="input" id="monthName" placeholder="Masher Name (e.g., October)"/>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button class="btn btn-secondary" id="cancel">Skip</button>
      <button class="btn btn-primary" id="save">Save</button>
    </div>
  `);
  document.getElementById("save").onclick = () => {
    store.setBills({
      water: document.getElementById("water").value,
      electricity: document.getElementById("electricity").value,
      avg6m: document.getElementById("avg6m").value,
      monthName: document.getElementById("monthName").value,
    });
    toast("Data Successfully Added ✅");
    modal.remove();
  };
  document.getElementById("cancel").onclick = () => modal.remove();
}

export function renderResetModal(store, mount) {
  const existingPin = localStorage.getItem("rbkh_reset_pin");

  if (!existingPin) {
    // First time: set PIN
    const modal = baseModal("Set Reset PIN", `
      <p style="margin:0 0 8px;">Set a 4-digit PIN to protect Reset All Data.</p>
      <input class="input" id="pin1" type="password" inputmode="numeric" maxlength="4" placeholder="Enter 4-digit PIN"/>
      <input class="input" id="pin2" type="password" inputmode="numeric" maxlength="4" placeholder="Confirm 4-digit PIN"/>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <button class="btn btn-secondary" id="cancel">Cancel</button>
        <button class="btn btn-primary" id="savePin">Save PIN</button>
      </div>
    `);
    document.getElementById("savePin").onclick = () => {
      const p1 = (document.getElementById("pin1").value || "").trim();
      const p2 = (document.getElementById("pin2").value || "").trim();
      const valid = /^\d{4}$/.test(p1);
      if (!valid) { showToast("PIN must be 4 digits"); return; }
      if (p1 !== p2) { showToast("PINs do not match"); return; }
      localStorage.setItem("rbkh_reset_pin", p1);
      showToast("PIN set ✅");
      modal.remove();
    };
    document.getElementById("cancel").onclick = () => modal.remove();
    return;
  }

  // Existing PIN: require to reset
  const modal = baseModal("Reset All Data", `
    <div class="badge">Confirmation lage</div>
    <p>Shob data clear hoye jabe. Nischit? Reset korte PIN din.</p>
    <input class="input" id="enterPin" type="password" inputmode="numeric" maxlength="4" placeholder="Enter 4-digit PIN"/>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button class="btn btn-secondary" id="cancel">Cancel</button>
      <button class="btn btn-primary" id="confirm">Reset</button>
    </div>
  `);
  document.getElementById("confirm").onclick = () => {
    const inputPin = (document.getElementById("enterPin").value || "").trim();
    if (inputPin !== existingPin) { showToast("Wrong PIN ❌"); return; }
    store.resetAll();
    showToast("All data reset ✅");
    modal.remove();
    mount("home");
  };
  document.getElementById("cancel").onclick = () => modal.remove();
}

function baseModal(title, inner) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-title">${title}</div>
      <div class="row">${inner}</div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  return modal;
}