(function (global) {
  function createInventoryMasterDataUi(config) {
    const options = Object.assign({
      document: global.document,
      getStore: () => null,
      fields: {},
      formatCount: (value) => String(value),
      escapeHtml: (value) => String(value == null ? "" : value),
      escapeAttr: (value) => String(value == null ? "" : value),
      t: (path, fallback) => fallback || path,
      statusBadge: (active) => active ? '<span class="badge">啟用</span>' : '<span class="badge warn">停用</span>',
      warehouseTypeLabel: (type) => type || "-",
      departmentTypeLabel: (type) => type || "-",
      roleLabel: (role) => role || "-"
    }, config);

    function store() {
      return options.getStore();
    }

    function renderProductCategoryOptions() {
      const categories = store().listProductCategories({ activeOnly: true });
      const optionRows = categories.map((category) => `<option value="${options.escapeAttr(String(category.id))}">${options.escapeHtml(category.name)}</option>`).join("");

      options.document.querySelectorAll("[data-category-select]").forEach((select) => {
        const selected = select.value;
        select.innerHTML = optionRows || '<option value="0">一般</option>';
        if (selected && categories.some((cat) => String(cat.id) === selected)) {
          select.value = selected;
        }
      });
    }

    function renderDepartmentOptions() {
      const departments = store().listDepartments({ activeOnly: true });
      const optionRows = departments
        .map((department) => `<option value="${department.id}">${options.escapeHtml(department.code)} / ${options.escapeHtml(department.name)}</option>`)
        .join("");

      options.document.querySelectorAll("[data-department-select]").forEach((select) => {
        const selected = select.value;
        select.innerHTML = optionRows || '<option value="">尚無可用部門</option>';
        if (selected && Array.from(select.options).some((option) => option.value === selected)) {
          select.value = selected;
        }
      });
    }

    function renderPartnerOptions() {
      const blank = `<option value="0">${options.t ? options.t("fields.unlinkedPartner", "— 未連結 —") : "— 未連結 —"}</option>`;
      const supplierOptions = blank + store().listPartners({ role: "supplier", activeOnly: true })
        .map((partner) => `<option value="${partner.id}">${options.escapeHtml(partner.name)}</option>`)
        .join("");
      const customerOptions = blank + store().listPartners({ role: "customer", activeOnly: true })
        .map((partner) => `<option value="${partner.id}">${options.escapeHtml(partner.name)}</option>`)
        .join("");

      options.document.querySelectorAll("[data-supplier-select]").forEach((select) => {
        const selected = select.value;
        select.innerHTML = supplierOptions;
        if (selected && Array.from(select.options).some((o) => o.value === selected)) { select.value = selected; }
      });
      options.document.querySelectorAll("[data-customer-select]").forEach((select) => {
        const selected = select.value;
        select.innerHTML = customerOptions;
        if (selected && Array.from(select.options).some((o) => o.value === selected)) { select.value = selected; }
      });
    }

    function renderProductCategories() {
      const categories = store().listProductCategories({ query: options.fields.categoryQuery.value });
      options.document.querySelector("#category-count").textContent = `${options.formatCount(categories.length)} ${options.t("common.countUnit", "筆")}`;
      options.document.querySelector("#category-table").innerHTML = categories.length
        ? categories.map((category) => `
          <tr>
            <td>${options.escapeHtml(category.code)}</td>
            <td>${options.escapeHtml(category.name)}</td>
            <td>${options.formatCount(category.sortOrder)}</td>
            <td>${options.escapeHtml(category.note || options.t("common.noNote", "無備註"))}</td>
            <td>${options.statusBadge(category.active)}</td>
            <td>
              <div class="table-actions">
                ${category.active ? `<button class="text-button action-danger" type="button" title="${options.escapeAttr(options.t("tooltips.deactivateCategory", "停用分類；歷史商品資料保留。"))}" data-deactivate-category-id="${category.id}">${options.t("actions.deactivate", "停用")}</button>` : ""}
              </div>
            </td>
          </tr>
        `).join("")
        : `<tr><td colspan="6" class="empty">${options.t("emptyStates.noCategories", "尚未建立分類。")}</td></tr>`;
    }

    function renderWarehouses() {
      const warehouses = store().listWarehouses({ query: options.fields.warehouseQuery.value });
      options.document.querySelector("#warehouse-count").textContent = `${options.formatCount(warehouses.length)} ${options.t("common.countUnit", "筆")}`;
      options.document.querySelector("#warehouse-table").innerHTML = warehouses.length
        ? warehouses.map((warehouse) => `
          <tr>
            <td>${options.escapeHtml(warehouse.code)}</td>
            <td>${options.escapeHtml(warehouse.name)}</td>
            <td>${options.escapeHtml(options.warehouseTypeLabel(warehouse.type))}</td>
            <td>${options.escapeHtml(warehouse.note || options.t("common.noNote", "無備註"))}</td>
            <td>${options.statusBadge(warehouse.active)}</td>
            <td>
              <div class="table-actions">
                ${warehouse.active ? `<button class="text-button action-danger" type="button" title="${options.escapeAttr(options.t("tooltips.deactivateWarehouse", "停用倉庫；歷史庫存資料保留。"))}" data-deactivate-warehouse-id="${warehouse.id}">${options.t("actions.deactivate", "停用")}</button>` : ""}
              </div>
            </td>
          </tr>
        `).join("")
        : `<tr><td colspan="6" class="empty">${options.t("emptyStates.noWarehouses", "尚未建立倉庫。")}</td></tr>`;
    }

    function renderDepartments() {
      const departments = store().listDepartments({ query: options.fields.departmentQuery.value });
      options.document.querySelector("#department-count").textContent = `${options.formatCount(departments.length)} ${options.t("common.countUnit", "筆")}`;
      options.document.querySelector("#department-table").innerHTML = departments.length
        ? departments.map((department) => `
          <tr>
            <td>${options.escapeHtml(department.code)}</td>
            <td>${options.escapeHtml(department.name)}</td>
            <td>${options.escapeHtml(options.departmentTypeLabel(department.type))}</td>
            <td>${options.escapeHtml(department.note || options.t("common.noNote", "無備註"))}</td>
            <td>${options.statusBadge(department.active)}</td>
            <td>
              <div class="table-actions">
                ${department.active ? `<button class="text-button action-danger" type="button" title="停用部門；歷史單據仍保留原部門線索。" data-deactivate-department-id="${department.id}">${options.t("actions.deactivate", "停用")}</button>` : ""}
              </div>
            </td>
          </tr>
        `).join("")
        : '<tr><td colspan="6" class="empty">尚未建立部門。</td></tr>';
    }

    function renderEmployees() {
      const employees = store().listEmployees({ query: options.fields.employeeQuery.value });
      options.document.querySelector("#employee-count").textContent = `${options.formatCount(employees.length)} ${options.t("common.countUnit", "筆")}`;
      options.document.querySelector("#employee-table").innerHTML = employees.length
        ? employees.map((employee) => {
          const department = store().listDepartments().find((item) => item.id === employee.departmentId);
          return `
          <tr>
            <td>${options.escapeHtml(employee.employeeNo)}</td>
            <td>${options.escapeHtml(employee.name)}</td>
            <td>${options.escapeHtml(department ? department.name : "未指定部門")}</td>
            <td>${options.escapeHtml(options.roleLabel(employee.role))}</td>
            <td>${options.statusBadge(employee.active)}</td>
            <td>
              <div class="table-actions">
                ${employee.active ? `<button class="text-button action-danger" type="button" title="停用員工；歷史操作仍會保留原操作者。" data-deactivate-employee-id="${employee.id}">${options.t("actions.deactivate", "停用")}</button>` : ""}
              </div>
            </td>
          </tr>`;
        }).join("")
        : '<tr><td colspan="6" class="empty">尚未建立員工。</td></tr>';
    }

    function renderPartners() {
      const partners = store().listPartners({
        query: options.fields.partnerQuery.value,
        role: options.fields.partnerRoleFilter.value
      });

      options.document.querySelector("#partner-table").innerHTML = partners.length
        ? partners.map((partner) => `
          <tr>
            <td>${partner.role === "supplier" ? options.t("common.supplier", "供應商") : options.t("common.customer", "客戶")}</td>
            <td>
              <div class="row-title">
                <strong>${options.escapeHtml(partner.name)}</strong>
                <span>${options.escapeHtml(partner.note || options.t("common.noNote", "無備註"))}</span>
              </div>
            </td>
            <td>${options.escapeHtml(partner.contact || options.t("common.notFilled", "未填"))}</td>
            <td>${options.escapeHtml(partner.phone || options.t("common.notFilled", "未填"))}</td>
            <td>${options.statusBadge(partner.active)}</td>
            <td>
              <div class="table-actions">
                <button class="text-button" type="button" title="${options.escapeAttr(options.t("tooltips.editPartner", "編輯往來對象資料。"))}" data-edit-partner-id="${partner.id}">${options.t("actions.edit", "編輯")}</button>
                ${partner.active ? `<button class="text-button action-danger" type="button" title="${options.escapeAttr(options.t("tooltips.deactivatePartner", "停用往來對象；歷史單據仍保留。"))}" data-deactivate-partner-id="${partner.id}">${options.t("actions.deactivate", "停用")}</button>` : ""}
              </div>
            </td>
          </tr>
        `).join("")
        : `<tr><td colspan="6" class="empty">${options.t("emptyStates.noPartners", "尚未建立往來對象。")}</td></tr>`;
    }

    return {
      renderProductCategoryOptions,
      renderDepartmentOptions,
      renderPartnerOptions,
      renderProductCategories,
      renderWarehouses,
      renderDepartments,
      renderEmployees,
      renderPartners
    };
  }

  const api = { createInventoryMasterDataUi };
  global.ClaudeOpenStockFlowMasterDataUi = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
