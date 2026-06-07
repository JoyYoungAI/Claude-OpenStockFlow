// Master data: products, categories, warehouses, partners, departments, employees

function bindMasterHandlers() {
  productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("manageProducts")) { return; }
    const data = Object.fromEntries(new FormData(productForm));
    const wasEditing = Boolean(editingProductId);
    data.categoryId = data.category;
    const product = wasEditing ? store.updateProduct(editingProductId, data) : store.addProduct(data);
    if (!product) { setStatus(ClaudeOpenStockFlowMessages.message("productSaveFailed"), true); return; }
    if (product.error === "DUPLICATE_SKU") { setStatus(ClaudeOpenStockFlowMessages.message("duplicateSku"), true); return; }
    recordAudit(wasEditing ? "update" : "create", {
      entityType: "product", entityId: product.id,
      summary: `${wasEditing ? "更新" : "新增"}商品：${product.name}`,
      before: wasEditing ? { productId: editingProductId } : {},
      after: { sku: product.sku, name: product.name, categoryId: product.categoryId, cost: product.cost, price: product.price },
      riskLevel: wasEditing ? "high" : "medium"
    });
    resetProductForm();
    saveState();
    setStatus(interpolate(t(wasEditing ? "messages.productUpdated" : "messages.productAdded", wasEditing ? "已更新商品：{name}" : "已新增商品：{name}"), { name: product.name }));
    render();
  });

  cancelProductEdit.addEventListener("click", () => {
    resetProductForm();
    setStatus(t("messages.productEditCancelled", "已取消商品編輯。"));
    renderProducts();
  });

  partnerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("managePartners")) { return; }
    const data = Object.fromEntries(new FormData(partnerForm));
    const wasEditing = Boolean(editingPartnerId);
    const partner = wasEditing ? store.updatePartner(editingPartnerId, data) : store.addPartner(data);
    if (!partner) { setStatus(ClaudeOpenStockFlowMessages.message("partnerSaveFailed"), true); return; }
    if (partner.error === "DUPLICATE_PARTNER") { setStatus(ClaudeOpenStockFlowMessages.message("duplicatePartner"), true); return; }
    recordAudit(wasEditing ? "update" : "create", {
      entityType: "partner", entityId: partner.id,
      summary: `${wasEditing ? "更新" : "新增"}往來對象：${partner.name}`,
      after: { role: partner.role, name: partner.name, contact: partner.contact },
      riskLevel: "medium"
    });
    resetPartnerForm();
    saveState();
    setStatus(interpolate(t(wasEditing ? "messages.partnerUpdated" : "messages.partnerAdded", wasEditing ? "已更新往來對象：{name}" : "已新增往來對象：{name}"), { name: partner.name }));
    render();
  });

  cancelPartnerEdit.addEventListener("click", () => {
    resetPartnerForm();
    setStatus(t("messages.partnerEditCancelled", "已取消往來對象編輯。"));
    renderPartners();
  });

  categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("manageMasterData")) { return; }
    const category = store.addProductCategory(Object.fromEntries(new FormData(categoryForm)));
    if (!category) { setStatus(ClaudeOpenStockFlowMessages.message("categorySaveFailed"), true); return; }
    recordAudit("create", {
      entityType: "productCategory", entityId: category.id,
      summary: `新增分類：${category.name}`,
      after: { code: category.code, name: category.name }, riskLevel: "low"
    });
    categoryForm.reset();
    categoryForm.elements.sortOrder.value = "10";
    saveState();
    setStatus(interpolate(t("messages.categoryAdded", "已新增分類：{name}"), { name: category.name }));
    render();
  });

  warehouseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("manageMasterData")) { return; }
    const warehouse = store.addWarehouse(Object.fromEntries(new FormData(warehouseForm)));
    if (!warehouse) { setStatus(ClaudeOpenStockFlowMessages.message("warehouseSaveFailed"), true); return; }
    recordAudit("create", {
      entityType: "warehouse", entityId: warehouse.id,
      summary: `新增倉庫：${warehouse.name}`,
      after: { code: warehouse.code, name: warehouse.name, type: warehouse.type }, riskLevel: "medium"
    });
    warehouseForm.reset();
    saveState();
    setStatus(interpolate(t("messages.warehouseAdded", "已新增倉庫：{name}"), { name: warehouse.name }));
    render();
  });

  departmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("manageMasterData")) { return; }
    const department = store.addDepartment(Object.fromEntries(new FormData(departmentForm)));
    if (!department) { setStatus(ClaudeOpenStockFlowMessages.message("departmentSaveFailed"), true); return; }
    recordAudit("create", {
      entityType: "department", entityId: department.id,
      summary: `新增部門：${department.name}`,
      after: { code: department.code, name: department.name, type: department.type }, riskLevel: "medium"
    });
    departmentForm.reset();
    saveState();
    setStatus(interpolate(t("messages.departmentAdded", "已新增部門：{name}"), { name: department.name }));
    render();
  });

  employeeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!requireAction("manageMasterData")) { return; }
    const employee = store.addEmployee(Object.fromEntries(new FormData(employeeForm)));
    if (!employee) { setStatus(ClaudeOpenStockFlowMessages.message("employeeSaveFailed"), true); return; }
    recordAudit("create", {
      entityType: "employee", entityId: employee.id,
      summary: `新增員工：${employee.name}`,
      after: { employeeNo: employee.employeeNo, name: employee.name, departmentId: employee.departmentId, role: employee.role },
      riskLevel: "medium"
    });
    employeeForm.reset();
    saveState();
    setStatus(interpolate(t("messages.employeeAdded", "已新增員工：{name}"), { name: employee.name }));
    render();
  });

  document.querySelector("#product-table").addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-product-id]");
    if (editButton) {
      if (!requireAction("manageProducts")) { return; }
      startProductEdit(Number(editButton.dataset.editProductId));
      return;
    }
    const button = event.target.closest("[data-deactivate-id]");
    if (!button) { return; }
    if (!requireAction("manageProducts")) { return; }
    const product = store.listProducts().find((item) => item.id === Number(button.dataset.deactivateId));
    if (!product || !confirmAction("deactivateProduct", { name: product.name })) { return; }
    const deactivatedProduct = store.deactivateProduct(product.id);
    if (deactivatedProduct && deactivatedProduct.error === "PRODUCT_HAS_OPEN_DOCUMENTS") {
      setStatus(t("messages.productDeactivationGuard", "此商品有進行中的單據（草稿 / 審核中），請結案後再停用。"), true);
    } else if (deactivatedProduct && !deactivatedProduct.error) {
      recordAudit("update", {
        entityType: "product", entityId: deactivatedProduct.id,
        summary: `停用商品：${deactivatedProduct.name}`,
        before: { active: true }, after: { active: false }, reason: "停用商品", riskLevel: "high"
      });
      saveState();
      setStatus(interpolate(t("messages.productDeactivated", "已停用商品：{name}"), { name: deactivatedProduct.name }));
      render();
    }
  });

  document.querySelector("#partner-table").addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-partner-id]");
    if (editButton) {
      if (!requireAction("managePartners")) { return; }
      startPartnerEdit(Number(editButton.dataset.editPartnerId));
      return;
    }
    const button = event.target.closest("[data-deactivate-partner-id]");
    if (!button) { return; }
    if (!requireAction("managePartners")) { return; }
    const partner = store.listPartners().find((item) => item.id === Number(button.dataset.deactivatePartnerId));
    if (!partner || !confirmAction("deactivatePartner", { name: partner.name })) { return; }
    const deactivatedPartner = store.deactivatePartner(partner.id);
    if (deactivatedPartner) {
      recordAudit("update", {
        entityType: "partner", entityId: deactivatedPartner.id,
        summary: `停用往來對象：${deactivatedPartner.name}`,
        before: { active: true }, after: { active: false }, reason: "停用往來對象", riskLevel: "medium"
      });
      saveState();
      setStatus(interpolate(t("messages.partnerDeactivated", "已停用往來對象：{name}"), { name: deactivatedPartner.name }));
      render();
    }
  });

  document.querySelector("#category-table").addEventListener("click", (event) => {
    const button = event.target.closest("[data-deactivate-category-id]");
    if (!button) { return; }
    if (!requireAction("manageMasterData")) { return; }
    const category = store.listProductCategories().find((item) => item.id === Number(button.dataset.deactivateCategoryId));
    if (!category || !confirmAction("deactivateCategory", { name: category.name })) { return; }
    const deactivatedCategory = store.deactivateProductCategory(category.id);
    if (deactivatedCategory) {
      recordAudit("update", {
        entityType: "productCategory", entityId: deactivatedCategory.id,
        summary: `停用分類：${deactivatedCategory.name}`,
        before: { active: true }, after: { active: false }, reason: "停用分類", riskLevel: "medium"
      });
      saveState();
      setStatus(interpolate(t("messages.categoryDeactivated", "已停用分類：{name}"), { name: deactivatedCategory.name }));
      render();
    }
  });

  document.querySelector("#warehouse-table").addEventListener("click", (event) => {
    const button = event.target.closest("[data-deactivate-warehouse-id]");
    if (!button) { return; }
    if (!requireAction("manageMasterData")) { return; }
    const warehouse = store.listWarehouses().find((item) => item.id === Number(button.dataset.deactivateWarehouseId));
    if (!warehouse || !confirmAction("deactivateWarehouse", { name: warehouse.name })) { return; }
    const deactivatedWarehouse = store.deactivateWarehouse(warehouse.id);
    if (deactivatedWarehouse && deactivatedWarehouse.error === "WAREHOUSE_HAS_OPEN_DOCUMENTS") {
      setStatus(t("messages.warehouseDeactivationGuard", "此倉庫有進行中的單據（草稿 / 審核中），請結案後再停用。"), true);
    } else if (deactivatedWarehouse && !deactivatedWarehouse.error) {
      recordAudit("update", {
        entityType: "warehouse", entityId: deactivatedWarehouse.id,
        summary: `停用倉庫：${deactivatedWarehouse.name}`,
        before: { active: true }, after: { active: false }, reason: "停用倉庫", riskLevel: "high"
      });
      saveState();
      setStatus(interpolate(t("messages.warehouseDeactivated", "已停用倉庫：{name}"), { name: deactivatedWarehouse.name }));
      render();
    }
  });

  document.querySelector("#department-table").addEventListener("click", (event) => {
    const button = event.target.closest("[data-deactivate-department-id]");
    if (!button) { return; }
    if (!requireAction("manageMasterData")) { return; }
    const department = store.listDepartments().find((item) => item.id === Number(button.dataset.deactivateDepartmentId));
    if (!department || !confirmAction("deactivateDepartment", { name: department.name })) { return; }
    const deactivatedDepartment = store.deactivateDepartment(department.id);
    if (deactivatedDepartment) {
      recordAudit("update", {
        entityType: "department", entityId: deactivatedDepartment.id,
        summary: `停用部門：${deactivatedDepartment.name}`,
        before: { active: true }, after: { active: false }, reason: "停用部門", riskLevel: "high"
      });
      saveState();
      setStatus(interpolate(t("messages.departmentDeactivated", "已停用部門：{name}"), { name: deactivatedDepartment.name }));
      render();
    }
  });

  document.querySelector("#employee-table").addEventListener("click", (event) => {
    const button = event.target.closest("[data-deactivate-employee-id]");
    if (!button) { return; }
    if (!requireAction("manageMasterData")) { return; }
    const employee = store.listEmployees().find((item) => item.id === Number(button.dataset.deactivateEmployeeId));
    if (!employee || !confirmAction("deactivateEmployee", { name: employee.name })) { return; }
    const deactivatedEmployee = store.deactivateEmployee(employee.id);
    if (deactivatedEmployee) {
      if (currentUser.employeeId === deactivatedEmployee.id) { currentUser = loadCurrentUser(); }
      recordAudit("update", {
        entityType: "employee", entityId: deactivatedEmployee.id,
        summary: `停用員工：${deactivatedEmployee.name}`,
        before: { active: true, canLogin: true }, after: { active: false, canLogin: false },
        reason: "停用員工", riskLevel: "high"
      });
      saveState();
      setStatus(interpolate(t("messages.employeeDeactivated", "已停用員工：{name}"), { name: deactivatedEmployee.name }));
      render();
    }
  });

  productQuery.addEventListener("input", renderProducts);
  productCategoryFilter.addEventListener("change", renderProducts);
  categoryQuery.addEventListener("input", renderProductCategories);
  warehouseQuery.addEventListener("input", renderWarehouses);
  departmentQuery.addEventListener("input", renderDepartments);
  employeeQuery.addEventListener("input", renderEmployees);
  partnerQuery.addEventListener("input", renderPartners);
  partnerRoleFilter.addEventListener("change", renderPartners);
}

function renderProducts() {
  const products = store.listProducts({ query: productQuery.value, category: productCategoryFilter.value });
  const body = document.querySelector("#product-table");
  body.innerHTML = products.length
    ? products.map((product) => `
      <tr>
        <td>${escapeHtml(product.sku)}</td>
        <td><div class="row-title"><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(product.unit)}</span></div></td>
        <td>${escapeHtml(categoryName(product.categoryId))}</td>
        <td>${formatRestrictedMoney(product.cost, "viewCost")}</td>
        <td>${formatRestrictedMoney(product.price, "viewPrice")}</td>
        <td>${statusBadge(product.active)}</td>
        <td><div class="table-actions">
          <button class="text-button" type="button" title="${escapeAttr(t("tooltips.editProduct", "編輯這項商品資料。"))}" data-edit-product-id="${product.id}">${t("actions.edit", "編輯")}</button>
          ${product.active ? `<button class="text-button action-danger" type="button" title="${escapeAttr(t("tooltips.deactivateProduct", "停用商品；歷史紀錄保留，但新增單據不能再選用。"))}" data-deactivate-id="${product.id}">${t("actions.deactivate", "停用")}</button>` : ""}
        </div></td>
      </tr>
    `).join("")
    : `<tr><td colspan="7" class="empty">${t("emptyStates.noProducts", "沒有符合條件的商品。")}</td></tr>`;
}

function startProductEdit(productId) {
  const product = store.listProducts().find((item) => item.id === productId);
  if (!product) { setStatus(t("messages.productNotFound", "找不到要編輯的商品。"), true); return; }
  editingProductId = product.id;
  productForm.elements.id.value = product.id;
  productForm.elements.sku.value = product.sku;
  productForm.elements.name.value = product.name;
  productForm.elements.category.value = String(product.categoryId || 0);
  productForm.elements.unit.value = product.unit;
  productForm.elements.cost.value = product.cost;
  productForm.elements.price.value = product.price;
  productForm.elements.safetyStock.value = product.safetyStock;
  productFormTitle.textContent = t("actions.edit", "編輯") + t("tables.product", "商品");
  productSubmitButton.textContent = t("actions.updateProduct", "更新商品");
  cancelProductEdit.classList.remove("is-hidden");
  setStatus(interpolate(t("messages.productEditing", "正在編輯商品：{name}"), { name: product.name }));
}

function resetProductForm() {
  editingProductId = null;
  productForm.reset();
  productForm.elements.id.value = "";
  const firstCat = store.listProductCategories({ activeOnly: true })[0];
  productForm.elements.category.value = firstCat ? String(firstCat.id) : "0";
  productForm.elements.unit.value = "件";
  productForm.elements.safetyStock.value = "5";
  productFormTitle.textContent = t("actions.addProduct", "新增商品");
  productSubmitButton.textContent = t("actions.addProduct", "新增商品");
  cancelProductEdit.classList.add("is-hidden");
}

function renderProductCategories() { masterDataUi.renderProductCategories(); }
function renderWarehouses() { masterDataUi.renderWarehouses(); }
function renderDepartments() { masterDataUi.renderDepartments(); }
function renderEmployees() { masterDataUi.renderEmployees(); }
function renderPartners() { masterDataUi.renderPartners(); }

function startPartnerEdit(partnerId) {
  const partner = store.listPartners().find((item) => item.id === partnerId);
  if (!partner) { setStatus(t("messages.partnerNotFound", "找不到要編輯的往來對象。"), true); return; }
  editingPartnerId = partner.id;
  partnerForm.elements.id.value = partner.id;
  partnerForm.elements.role.value = partner.role;
  partnerForm.elements.name.value = partner.name;
  partnerForm.elements.contact.value = partner.contact;
  partnerForm.elements.phone.value = partner.phone;
  partnerForm.elements.note.value = partner.note;
  partnerFormTitle.textContent = t("headings.editPartner", "編輯往來對象");
  partnerSubmitButton.textContent = t("actions.updatePartner", "更新對象");
  cancelPartnerEdit.classList.remove("is-hidden");
  setStatus(interpolate(t("messages.partnerEditing", "正在編輯往來對象：{name}"), { name: partner.name }));
}

function resetPartnerForm() {
  editingPartnerId = null;
  partnerForm.reset();
  partnerForm.elements.id.value = "";
  partnerForm.elements.role.value = "supplier";
  partnerFormTitle.textContent = t("actions.addPartner", "新增往來對象");
  partnerSubmitButton.textContent = t("actions.addPartner", "新增往來對象");
  cancelPartnerEdit.classList.add("is-hidden");
}

function renderStockFilters() {
  renderCategorySelect(categoryFilter, t("filters.allCategories", "全部分類"));
  renderWarehouseFilter(warehouseFilter, t("filters.allWarehouses", "全部倉庫"));
}

function renderProductFilters() { renderCategorySelect(productCategoryFilter, t("filters.allCategories", "全部分類")); }
function renderProductCategoryOptions() { masterDataUi.renderProductCategoryOptions(); }

function renderCategorySelect(select, emptyLabel) {
  const current = select.value;
  const categories = store.listProductCategories({ activeOnly: true });
  const opts = [`<option value="">${escapeHtml(emptyLabel)}</option>`]
    .concat(categories.map((cat) => `<option value="${escapeAttr(String(cat.id))}">${escapeHtml(cat.name)}</option>`));
  select.innerHTML = opts.join("");
  select.value = categories.some((cat) => String(cat.id) === current) ? current : "";
}

function renderWarehouseFilter(select, emptyLabel) {
  const current = select.value;
  const warehouses = store.listWarehouses({ activeOnly: true });
  const options = [`<option value="">${escapeHtml(emptyLabel)}</option>`]
    .concat(warehouses.map((warehouse) => `<option value="${warehouse.id}">${escapeHtml(warehouse.code)} / ${escapeHtml(warehouse.name)}</option>`));
  select.innerHTML = options.join("");
  select.value = warehouses.some((warehouse) => String(warehouse.id) === current) ? current : "";
}

function renderProductOptions() {
  const products = store.listProducts({ activeOnly: true });
  const inventoryRows = store.inventoryReport();
  const options = products.map((product) => {
    const stock = inventoryRows.filter((item) => item.productId === product.id).reduce((total, item) => total + item.onHand, 0);
    return `<option value="${product.id}">${escapeHtml(product.sku)} / ${escapeHtml(product.name)} / ${t("common.totalStock", "總庫存")} ${formatQuantity(stock)}</option>`;
  }).join("");
  document.querySelectorAll("[data-product-select]").forEach((select) => {
    const selected = select.value;
    const blank = select.required ? "" : `<option value="">${t("fields.secondProductOptional", "不新增第二筆")}</option>`;
    select.innerHTML = options ? blank + options : `<option value="">${t("emptyStates.noActiveProducts", "尚無啟用商品")}</option>`;
    if (selected && Array.from(select.options).some((option) => option.value === selected)) { select.value = selected; }
  });
}

function renderWarehouseOptions() {
  const warehouses = store.listWarehouses({ activeOnly: true });
  const saleTypes = ["warehouse", "store"];
  document.querySelectorAll("[data-warehouse-select]").forEach((select) => {
    const isSaleWarehouse = select.hasAttribute("data-sale-warehouse");
    const filtered = isSaleWarehouse ? warehouses.filter((w) => saleTypes.includes(w.type)) : warehouses;
    const options = filtered.map((warehouse) => `<option value="${warehouse.id}">${escapeHtml(warehouse.code)} / ${escapeHtml(warehouse.name)}</option>`).join("");
    const selected = select.value;
    select.innerHTML = options || `<option value="">${t("emptyStates.noAvailableWarehouses", "沒有可用倉庫")}</option>`;
    if (selected && Array.from(select.options).some((option) => option.value === selected)) { select.value = selected; }
  });
}

function renderDepartmentOptions() { masterDataUi.renderDepartmentOptions(); }
function renderPartnerOptions() { masterDataUi.renderPartnerOptions(); }

function renderTransferProductOptions() {
  const fromWarehouseId = Number(document.querySelector("#transfer-from-warehouse") && document.querySelector("#transfer-from-warehouse").value);
  const products = store.listProducts({ activeOnly: true });
  const inventoryRows = store.inventoryReport();
  const options = products.map((product) => {
    const stock = inventoryRows
      .filter((item) => item.productId === product.id && (!fromWarehouseId || item.warehouseId === fromWarehouseId))
      .reduce((total, item) => total + item.onHand, 0);
    const label = fromWarehouseId
      ? t("common.warehouseStock", "倉庫庫存")
      : t("common.totalStock", "總庫存");
    return `<option value="${product.id}">${escapeHtml(product.sku)} / ${escapeHtml(product.name)} / ${label} ${formatQuantity(stock)}</option>`;
  }).join("");
  document.querySelectorAll("[data-transfer-product-select]").forEach((select) => {
    const selected = select.value;
    const blank = select.required ? "" : `<option value="">${t("fields.secondProductOptional", "不新增第二筆")}</option>`;
    select.innerHTML = options ? blank + options : `<option value="">${t("emptyStates.noActiveProducts", "尚無啟用商品")}</option>`;
    if (selected && Array.from(select.options).some((option) => option.value === selected)) { select.value = selected; }
  });
}
