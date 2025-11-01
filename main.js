import { Store } from "./store.js";
import { showToast, showEyeModal, showMenuDropdown } from "./components.js";
import { renderView } from "./views.js";

const appEl = document.getElementById("app");
const store = new Store();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      // Compute a stable absolute URL to the service worker without causing redirects
      const basePath = location.pathname.endsWith("/")
        ? location.pathname
        : location.pathname.replace(/[^/]+$/, "");
      const swUrl = `${location.origin}${basePath}service-worker.js`;

      await navigator.serviceWorker.register(swUrl, { scope: basePath });
      console.log("SW registered:", swUrl);
    } catch (err) {
      console.error("SW register failed:", err);
    }
  });
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; maybeShowInstall(); });

function maybeShowInstall() {
  const first = localStorage.getItem("rbkh_install_shown");
  if (!first && deferredPrompt) {
    import("./components.js").then((m) =>
      m.showInstallPrompt({
        onInstall: async () => { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; },
        onLater: () => { deferredPrompt = null; }
      })
    );
    localStorage.setItem("rbkh_install_shown", "1");
  }
}

function header(view) {
  return `
    <div class="header">
      <div class="header-inner">
        ${view!=="home" ? `<button class="icon-btn" id="backBtn" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>` : ""}
        <div class="header-title">Room Bazar & Khawa Hisab</div>
        <button class="icon-btn" id="menuBtn" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2" fill="#0f172a"/><circle cx="12" cy="12" r="2" fill="#0f172a"/><circle cx="12" cy="19" r="2" fill="#0f172a"/></svg>
        </button>
      </div>
    </div>
  `;
}

function getIcon(id) {
  const c = "#0f172a";
  const icons = {
    home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 10l8-6 8 6v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z" stroke="${c}" stroke-width="1.6"/><path d="M10 20v-6h4v6" stroke="${c}" stroke-width="1.6"/></svg>`,
    bazar: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6h14l-2 9H8L6 6Z" stroke="${c}" stroke-width="1.6"/><circle cx="9" cy="19" r="2" fill="${c}"/><circle cx="17" cy="19" r="2" fill="${c}"/></svg>`,
    meal: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 4v8a3 3 0 0 0 3 3h0V4" stroke="${c}" stroke-width="1.6"/><path d="M17 4v11" stroke="${c}" stroke-width="1.6"/><path d="M14 4v4" stroke="${c}" stroke-width="1.6"/></svg>`,
    member: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="8" r="3" stroke="${c}" stroke-width="1.6"/><circle cx="16" cy="8" r="3" stroke="${c}" stroke-width="1.6"/><path d="M3 20c0-3 3-5 5-5" stroke="${c}" stroke-width="1.6"/><path d="M13 15c2 0 5 2 5 5" stroke="${c}" stroke-width="1.6"/></svg>`,
    settings: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="${c}" stroke-width="1.6"/><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.3-2-3.5-2.3 1a7.1 7.1 0 0 0-2.3-1.3L14 3h-4l-.2 2.3A7.1 7.1 0 0 0 7.2 6L4.9 5l-2 3.5 2 1.3A7 7 0 0 0 4.7 12c0 .6.1 1.1.2 1.6l-2 1.3 2 3.5 2.3-1a7.1 7.1 0 0 0 2.3 1.3L9.8 21h4l.2-2.3a7.1 7.1 0 0 0 2.3-1.3l2.3 1 2-3.5-2-1.3c.1-.5.2-1 .2-1.6Z" stroke="${c}" stroke-width="1.2"/></svg>`,
    eye: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="${c}" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="${c}"/></svg>`,
  };
  return icons[id] || "";
}

function bottomNav(active = "home") {
  const tabs = [
    { id: "home", label: "Home" },
    { id: "bazar", label: "Bazar" },
    { id: "meal", label: "Meal" },
    { id: "member", label: "Member" },
    { id: "settings", label: "Settings" },
  ];
  return `
    <nav class="bottom-nav">
      ${tabs.map((t) => `
        <a href="#" data-tab="${t.id}" class="nav-btn">
          ${getIcon(t.id)}
          <div>${t.label}</div>
        </a>`).join("")}
      <a href="#" id="eyeBtnBottom" class="nav-btn eye-btn" aria-label="Help/Share">
        ${getIcon("eye")}
        <div>Help</div>
      </a>
    </nav>
  `;
}

function mount(view = "home", push = true) {
  appEl.innerHTML = `<div class="app">${header(view)}${renderView(store, view)}${bottomNav(view)}</div>`;
  if (push) history.pushState({ view }, "", `#${view}`);
  document.querySelectorAll(".nav-btn:not(.eye-btn)").forEach((el) =>
    el.addEventListener("click", (e) => { e.preventDefault(); mount(el.dataset.tab); }),
  );
  document.getElementById("backBtn")?.addEventListener("click", () => {
    if (history.state?.view) history.back(); else mount("home", false);
  });
  document.getElementById("menuBtn")?.addEventListener("click", (e) => showMenuDropdown(store, e, mount, showToast));
  document.getElementById("eyeBtnBottom")?.addEventListener("click", (e) => { e.preventDefault(); showEyeModal(store); });
  document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => handleAction(el.dataset.action)));
}

function handleAction(action) {
  switch (action) {
    case "add-member":
      mount("member");
      document.getElementById("addMemberOpen")?.click();
      break;
    case "daily-bazar":
      mount("bazar");
      document.getElementById("addBazarOpen")?.click();
      break;
    case "meal-record":
      mount("meal");
      break;
    case "bazar-list":
      mount("bazar");
      break;
    case "monthly-bill":
      mount("home");
      document.getElementById("monthlyBillOpen")?.click();
      break;
    case "download-report":
      import("./report.js").then((m) => m.generateReportPNG(store));
      break;
    default:
      break;
  }
}

window.onpopstate = (e) => {
  const v = e.state?.view || (location.hash?.slice(1) || "home");
  mount(v, false);
};

const initialView = location.hash ? location.hash.slice(1) : "home";
mount(initialView, false);