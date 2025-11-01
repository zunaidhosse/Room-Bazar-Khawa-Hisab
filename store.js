export class Store {
  constructor() {
    this.key = "rbkh_v1";
    const saved = JSON.parse(localStorage.getItem(this.key) || "{}");
    this.members = saved.members || []; // {id, name, joinDate, meals=0, bazar=0}
    this.bazar = saved.bazar || []; // {id, date, memberId, amount, note}
    this.bills = saved.bills || { water: 0, electricity: 0, avg6m: 0, monthName: "" };
    this.settings = saved.settings || { currency: "SAR", lang: "phonetic", theme: "light", mealPeriodDays: 30 };
    this.sync();
  }
  sync() {
    localStorage.setItem(
      this.key,
      JSON.stringify({
        members: this.members,
        bazar: this.bazar,
        bills: this.bills,
        settings: this.settings,
      }),
    );
  }
  addMember(name, joinDate = "") {
    const id = crypto.randomUUID();
    this.members.push({ id, name, joinDate, meals: 0, bazar: 0 });
    this.sync();
  }
  addBazar(memberId, amount, note = "") {
    const id = crypto.randomUUID();
    const date = new Date().toISOString().slice(0, 10);
    this.bazar.push({ id, date, memberId, amount: Number(amount), note });
    const m = this.members.find((x) => x.id === memberId);
    if (m) m.bazar += Number(amount);
    this.sync();
  }
  adjustMeals(memberId, delta) {
    const m = this.members.find((x) => x.id === memberId);
    if (!m) return;
    m.meals = Math.max(0, (m.meals || 0) + delta);
    this.sync();
  }
  setBills({ water, electricity, avg6m, monthName }) {
    this.bills = {
      water: Number(water) || 0,
      electricity: Number(electricity) || 0,
      avg6m: Number(avg6m) || 0,
      monthName: monthName || "",
    };
    this.sync();
  }
  setSettings({ currency, lang, theme, mealPeriodDays }) {
    if (currency) this.settings.currency = currency;
    if (lang) this.settings.lang = lang;
    if (theme) this.settings.theme = theme;
    if (mealPeriodDays) this.settings.mealPeriodDays = Number(mealPeriodDays);
    document.body.classList.toggle("dark", this.settings.theme === "dark");
    this.sync();
  }
  totals() {
    const totalMembers = this.members.length;
    const totalBazar = this.members.reduce((s, m) => s + (m.bazar || 0), 0);
    const totalMeals = this.members.reduce((s, m) => s + (m.meals || 0), 0);
    const billsTotal = (this.bills.water || 0) + (this.bills.electricity || 0);
    const effectiveTotal = totalBazar + billsTotal;
    const perMeal = totalMeals > 0 ? effectiveTotal / totalMeals : 0;
    const membersBalance = this.members.map((m) => {
      const shouldPay = (m.meals || 0) * perMeal;
      const balance = (m.bazar || 0) - shouldPay;
      return { id: m.id, name: m.name, meals: m.meals || 0, bazar: m.bazar || 0, balance, shouldPay };
    });
    return { totalMembers, totalBazar, totalMeals, perMeal, billsTotal, membersBalance };
  }
  resetAll() {
    this.members = [];
    this.bazar = [];
    this.bills = { water: 0, electricity: 0, avg6m: 0, monthName: "" };
    this.settings = { currency: "SAR", lang: "phonetic", theme: "light", mealPeriodDays: 30 };
    this.sync();
  }
}

