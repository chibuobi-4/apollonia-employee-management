const $ = (sel) => document.querySelector(sel);

const api = {
  departments: "/api/departments",
  employees: "/api/employees",
};

const els = {
  statusPill: $("#statusPill"),
  refreshBtn: $("#refreshBtn"),
  toast: $("#toast"),

  deptCount: $("#deptCount"),
  empCount: $("#empCount"),

  deptCreateForm: $("#deptCreateForm"),
  deptName: $("#deptName"),
  deptTbody: $("#deptTbody"),
  deptSearch: $("#deptSearch"),

  empCreateForm: $("#empCreateForm"),
  empFirstName: $("#empFirstName"),
  empLastName: $("#empLastName"),
  empDept: $("#empDept"),
  empFilterDept: $("#empFilterDept"),
  empTbody: $("#empTbody"),

  modal: $("#modal"),
  modalForm: $("#modalForm"),
  modalTitle: $("#modalTitle"),
  modalBody: $("#modalBody"),
  modalSave: $("#modalSave"),
};

let state = {
  departments: [],
  employees: [],
  deptSearch: "",
  deptFilterId: "",
  modal: { type: null, data: null },
};

function setStatus(ok, text) {
  els.statusPill.textContent = text;
  els.statusPill.classList.remove("pill-ok", "pill-bad", "pill-muted");
  if (ok === true) els.statusPill.classList.add("pill-ok");
  else if (ok === false) els.statusPill.classList.add("pill-bad");
  else els.statusPill.classList.add("pill-muted");
}

let toastTimer = null;
function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

async function request(url, opts = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });

  const isJson = (res.headers.get("content-type") || "").includes(
    "application/json"
  );
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = typeof data === "object" && data?.message ? data.message : data;
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return data;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function deptNameById(id) {
  return state.departments.find((d) => d._id === id)?.name || "—";
}

function openModal(type, data) {
  state.modal = { type, data };
  els.modalBody.innerHTML = "";

  if (type === "editDepartment") {
    els.modalTitle.textContent = "Edit department";
    els.modalBody.innerHTML = `
      <div class="field">
        <label>Department name</label>
        <input id="modalDeptName" class="input" value="${escapeHtml(
          data.name
        )}" required minlength="2" maxlength="80" autocomplete="off" />
      </div>
    `;
  }

  if (type === "editEmployee") {
    els.modalTitle.textContent = "Edit employee";

    const deptOptions = state.departments
      .map(
        (d) =>
          `<option value="${escapeHtml(d._id)}" ${
            d._id === data.department?._id || d._id === data.department
              ? "selected"
              : ""
          }>${escapeHtml(d.name)}</option>`
      )
      .join("");

    els.modalBody.innerHTML = `
      <div class="field">
        <label>First name</label>
        <input id="modalEmpFirstName" class="input" value="${escapeHtml(
          data.firstName || ""
        )}" required minlength="1" maxlength="60" autocomplete="off" />
      </div>
      <div class="field">
        <label>Last name</label>
        <input id="modalEmpLastName" class="input" value="${escapeHtml(
          data.lastName || ""
        )}" required minlength="1" maxlength="60" autocomplete="off" />
      </div>
      <div class="field">
        <label>Department</label>
        <select id="modalEmpDept" class="input" required>
          ${deptOptions}
        </select>
      </div>
    `;
  }

  els.modal.showModal();
}

async function loadAll() {
  setStatus(null, "Refreshing…");

  const [departments, employees] = await Promise.all([
    request(api.departments),
    request(api.employees + (state.deptFilterId ? `?departmentId=${encodeURIComponent(state.deptFilterId)}` : "")),
  ]);

  state.departments = departments;
  state.employees = employees;

  render();
  setStatus(true, "Connected");
}

function renderCounts() {
  els.deptCount.textContent = String(state.departments.length);
  els.empCount.textContent = String(state.employees.length);
}

function renderDeptSelects() {
  const deptOptions = state.departments
    .map((d) => `<option value="${escapeHtml(d._id)}">${escapeHtml(d.name)}</option>`)
    .join("");

  els.empDept.innerHTML =
    `<option value="" disabled selected>Select a department</option>` +
    deptOptions;

  const currentFilter = els.empFilterDept.value || "";
  els.empFilterDept.innerHTML =
    `<option value="">All departments</option>` + deptOptions;
  els.empFilterDept.value = currentFilter;
}

function renderDepartments() {
  const q = state.deptSearch.trim().toLowerCase();
  const rows = state.departments
    .filter((d) => (q ? d.name.toLowerCase().includes(q) : true))
    .map((d) => {
      return `
        <tr>
          <td>${escapeHtml(d.name)}</td>
          <td class="td-right">
            <span class="row-actions">
              <button class="btn btn-warn btn-icon" type="button" data-action="dept-edit" data-id="${escapeHtml(
                d._id
              )}" aria-label="Edit">✎</button>
              <button class="btn btn-danger btn-icon" type="button" data-action="dept-del" data-id="${escapeHtml(
                d._id
              )}" aria-label="Delete">🗑</button>
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  els.deptTbody.innerHTML =
    rows || `<tr><td colspan="2" class="muted">No departments yet.</td></tr>`;
}

function renderEmployees() {
  const rows = state.employees
    .map((e) => {
      const deptName = e.department?.name || deptNameById(e.department);
      return `
        <tr>
          <td>${escapeHtml(`${e.firstName} ${e.lastName}`)}</td>
          <td>${escapeHtml(deptName)}</td>
          <td class="td-right">
            <span class="row-actions">
              <button class="btn btn-warn btn-icon" type="button" data-action="emp-edit" data-id="${escapeHtml(
                e._id
              )}" aria-label="Edit">✎</button>
              <button class="btn btn-danger btn-icon" type="button" data-action="emp-del" data-id="${escapeHtml(
                e._id
              )}" aria-label="Delete">🗑</button>
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  els.empTbody.innerHTML =
    rows || `<tr><td colspan="3" class="muted">No employees yet.</td></tr>`;
}

function render() {
  renderCounts();
  renderDeptSelects();
  renderDepartments();
  renderEmployees();
}

// Events
els.refreshBtn.addEventListener("click", () => loadAll().catch(onError));

els.deptSearch.addEventListener("input", (e) => {
  state.deptSearch = e.target.value;
  renderDepartments();
});

els.empFilterDept.addEventListener("change", async (e) => {
  state.deptFilterId = e.target.value;
  await loadAll().catch(onError);
});

els.deptCreateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = els.deptName.value.trim();
  if (!name) return;

  await request(api.departments, {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  els.deptName.value = "";
  toast("Department created");
  await loadAll();
});

els.empCreateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const firstName = els.empFirstName.value.trim();
  const lastName = els.empLastName.value.trim();
  const departmentId = els.empDept.value;

  if (!firstName || !lastName || !departmentId) return;

  await request(api.employees, {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, departmentId }),
  });

  els.empFirstName.value = "";
  els.empLastName.value = "";
  els.empDept.selectedIndex = 0;

  toast("Employee created");
  await loadAll();
});

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "dept-edit") {
    const dept = state.departments.find((d) => d._id === id);
    if (dept) openModal("editDepartment", dept);
  }

  if (action === "dept-del") {
    if (!confirm("Delete this department? Employees will still reference it.")) return;
    await request(`${api.departments}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    toast("Department deleted");
    await loadAll();
  }

  if (action === "emp-edit") {
    const emp = state.employees.find((x) => x._id === id);
    if (emp) openModal("editEmployee", emp);
  }

  if (action === "emp-del") {
    if (!confirm("Delete this employee?")) return;
    await request(`${api.employees}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    toast("Employee deleted");
    await loadAll();
  }
});

els.modalForm.addEventListener("submit", async (e) => {
  const { type, data } = state.modal;
  if (!type || !data) return;

  // If the user clicked "Cancel" or closed the dialog, do nothing
  if (els.modal.returnValue === "cancel") return;

  try {
    if (type === "editDepartment") {
      const name = $("#modalDeptName").value.trim();
      await request(`${api.departments}/${encodeURIComponent(data._id)}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      toast("Department updated");
    }

    if (type === "editEmployee") {
      const firstName = $("#modalEmpFirstName").value.trim();
      const lastName = $("#modalEmpLastName").value.trim();
      const departmentId = $("#modalEmpDept").value;

      await request(`${api.employees}/${encodeURIComponent(data._id)}`, {
        method: "PUT",
        body: JSON.stringify({ firstName, lastName, departmentId }),
      });
      toast("Employee updated");
    }

    await loadAll();
  } catch (err) {
    onError(err);
  }
});

function onError(err) {
  console.error(err);
  setStatus(false, "Error");
  toast(err?.message || "Something went wrong");
}

// Boot
loadAll().catch(onError);
