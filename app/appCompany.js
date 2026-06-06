// 公司帳套管理（方案 A：每家公司獨立 localStorage key）
// 舊版資料 key「stockflow-inventory-state」向後相容，首次建立公司時自動遷移。

(function () {
  var COMPANIES_KEY  = "stockflow-companies";
  var ACTIVE_KEY     = "stockflow-active-company";
  var LEGACY_KEY     = "stockflow-inventory-state";

  function companyStorageKey(id) { return "stockflow-company-" + id; }

  function loadCompanies() {
    try { return JSON.parse(localStorage.getItem(COMPANIES_KEY) || "[]"); } catch (e) { return []; }
  }
  function saveCompanies(list) { localStorage.setItem(COMPANIES_KEY, JSON.stringify(list)); }

  function getActiveCompanyId() { return localStorage.getItem(ACTIVE_KEY) || null; }
  function setActiveCompanyId(id) {
    if (id != null) localStorage.setItem(ACTIVE_KEY, String(id));
    else localStorage.removeItem(ACTIVE_KEY);
  }

  // 回傳目前應使用的 localStorage key
  // - 有 active company → stockflow-company-{id}
  // - 否則 → stockflow-inventory-state（舊版 / 示範模式）
  function getActiveCompanyStorageKey() {
    var id = getActiveCompanyId();
    return id ? companyStorageKey(id) : LEGACY_KEY;
  }

  function getActiveCompanyName() {
    var id = getActiveCompanyId();
    if (!id) return null;
    var found = loadCompanies().find(function (c) { return String(c.id) === String(id); });
    return found ? found.name : null;
  }

  // 新增公司；migrateFromLegacy=true 時將舊版資料移入新 key
  function createCompany(name, code, migrateFromLegacy) {
    var list = loadCompanies();
    var id = list.reduce(function (m, c) { return Math.max(m, Number(c.id) || 0); }, 0) + 1;
    var company = {
      id: id,
      name: String(name || "").trim() || "未命名公司",
      code: (String(code || "").trim().toUpperCase() || ("CO" + id)).slice(0, 10),
      createdAt: new Date().toISOString()
    };
    list.push(company);
    saveCompanies(list);
    if (migrateFromLegacy) {
      var legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        localStorage.setItem(companyStorageKey(id), legacy);
        localStorage.removeItem(LEGACY_KEY);
      }
    }
    return company;
  }

  function deleteCompany(id) {
    saveCompanies(loadCompanies().filter(function (c) { return Number(c.id) !== Number(id); }));
    localStorage.removeItem(companyStorageKey(id));
    if (getActiveCompanyId() === String(id)) setActiveCompanyId(null);
  }

  function switchCompany(id) {
    setActiveCompanyId(id);
    location.reload();
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  function escHtml(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function renderCompanySelector() {
    var el = document.getElementById("company-display");
    if (!el) return;
    var name = getActiveCompanyName();
    el.textContent = name || "示範模式";
  }

  function showCompanyModal() {
    var modal = document.getElementById("company-modal");
    if (!modal) return;
    _renderCompanyList();
    modal.hidden = false;
  }

  function hideCompanyModal() {
    var modal = document.getElementById("company-modal");
    if (modal) modal.hidden = true;
  }

  function _renderCompanyList() {
    var list = document.getElementById("company-list");
    if (!list) return;
    var companies = loadCompanies();
    var activeId = getActiveCompanyId();
    if (!companies.length) {
      list.innerHTML = '<p class="company-empty">尚無公司帳套。填寫下方表單即可建立。</p>';
      return;
    }
    list.innerHTML = companies.map(function (c) {
      var isActive = String(c.id) === String(activeId);
      return '<div class="company-item' + (isActive ? " is-active" : "") + '">' +
        '<span class="company-item-name">' + escHtml(c.name) + '</span>' +
        '<span class="company-item-code">' + escHtml(c.code) + '</span>' +
        (isActive
          ? '<span class="company-active-badge">使用中</span>'
          : '<button class="button-secondary" onclick="handleSwitchCompany(' + c.id + ')">切換</button>') +
        '<button class="button-danger-sm" onclick="handleDeleteCompany(' + c.id + ')" title="刪除此帳套及其所有資料">刪除</button>' +
        '</div>';
    }).join("");
  }

  // ── Global event handlers（index.html onclick 呼叫）────────────────────────

  window.handleSwitchCompany = function (id) {
    if (!confirm("切換至此公司帳套？頁面將重新載入。")) return;
    switchCompany(id);
  };

  window.handleDeleteCompany = function (id) {
    var companies = loadCompanies();
    var target = companies.find(function (c) { return Number(c.id) === Number(id); });
    if (!target) return;
    if (!confirm("刪除「" + target.name + "」的所有資料？此動作無法復原。")) return;
    deleteCompany(id);
    var remaining = loadCompanies();
    if (getActiveCompanyId() === String(id) || !getActiveCompanyId()) {
      if (remaining.length) { switchCompany(remaining[0].id); } else { location.reload(); }
    } else {
      _renderCompanyList();
    }
  };

  window.handleCreateCompany = function () {
    var nameEl = document.getElementById("new-company-name");
    var codeEl = document.getElementById("new-company-code");
    var name = nameEl ? nameEl.value.trim() : "";
    var code = codeEl ? codeEl.value.trim() : "";
    if (!name) { alert("請輸入公司名稱"); return; }
    var isFirst = !loadCompanies().length;
    var company = createCompany(name, code, isFirst);
    if (nameEl) nameEl.value = "";
    if (codeEl) codeEl.value = "";
    switchCompany(company.id);
  };

  window.showCompanyModal  = showCompanyModal;
  window.hideCompanyModal  = hideCompanyModal;

  // 供 app.js 取用
  window.getActiveCompanyStorageKey = getActiveCompanyStorageKey;
  window.renderCompanySelector      = renderCompanySelector;

  // 頁面載入後立即更新顯示
  renderCompanySelector();
})();
