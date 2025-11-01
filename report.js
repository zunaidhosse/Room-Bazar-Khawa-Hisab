import { toPng } from "html-to-image";

export async function generateReportPNG(store) {
  const { totalBazar, totalMeals, perMeal, billsTotal, membersBalance } = store.totals();
  const cur = store.settings.currency;
  const wrap = document.createElement("div");
  wrap.className = "modal";
  wrap.innerHTML = `
    <div class="modal-card">
      <div id="report" class="report">
        <div class="report-header">
          <div style="font-size:20px; font-weight:700;">Room Bazar & Khawa Hisab</div>
          <div style="opacity:.9;">${new Date().toLocaleDateString()} • ${store.bills.monthName || "Masher Name nai"}</div>
        </div>
        <div class="grid" style="grid-template-columns: 1fr 1fr;">
          <div class="card"><h4>Total Bazar</h4><div class="value">${totalBazar.toFixed(2)} ${cur}</div></div>
          <div class="card"><h4>Total Meals</h4><div class="value">${totalMeals}</div></div>
          <div class="card"><h4>Bills Total</h4><div class="value">${billsTotal.toFixed(2)} ${cur}</div></div>
          <div class="card"><h4>Per Meal Rate</h4><div class="value">${perMeal.toFixed(2)} ${cur}</div></div>
        </div>
        <div class="card" style="margin-top:12px;">
          <h4>Member Details</h4>
          <div class="list">
            ${membersBalance
              .map(
                (m) => `<div class="list-item">
                  <div><strong>${m.name}</strong><br/><small>Meals: ${m.meals} • Bazar: ${m.bazar.toFixed(2)} ${cur}</small></div>
                  <div style="text-align:right;">
                    <div>Should Pay: ${m.shouldPay.toFixed(2)} ${cur}</div>
                    <div style="font-weight:700; color:${m.balance>=0 ? '#16a34a' : '#dc2626'}">${m.balance>=0 ? 'Get' : 'Pay'} ${Math.abs(m.balance).toFixed(2)} ${cur}</div>
                  </div>
                </div>`,
              )
              .join("") || `<div class="list-item">No member</div>`}
          </div>
        </div>
      </div>
      <div style="display:flex; gap:8px; margin-top:10px;">
        <button class="btn btn-secondary" id="closeReport">Close</button>
        <button class="btn btn-primary" id="savePNG">Save PNG</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  wrap.addEventListener("click", (e) => { if (e.target === wrap) wrap.remove(); });
  document.getElementById("closeReport").onclick = () => wrap.remove();
  document.getElementById("savePNG").onclick = async () => {
    const node = document.getElementById("report");
    const dataUrl = await toPng(node, { cacheBust: true, quality: 0.98 });
    const link = document.createElement("a");
    link.download = `RoomBazarKhawaHisab_${store.bills.monthName || "Report"}.png`;
    link.href = dataUrl;
    link.click();
  };
}

