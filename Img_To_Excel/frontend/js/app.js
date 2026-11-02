const API_BASE = "http://127.0.0.1:8000";

function token() {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  return token() ? { Authorization: `Bearer ${token()}` } : {};
}

function showMessage(message, type = "danger", target = "pageMessage") {
  const element = document.getElementById(target);
  if (element) {
    element.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
  }
}

function showPopup(message, type = "danger") {
  const popup = document.getElementById("uploadPopup");
  if (!popup) {
    showMessage(message, type);
    return;
  }

  popup.textContent = message;
  popup.className = `upload-popup alert alert-${type} show`;
  window.clearTimeout(showPopup.timeout);
  showPopup.timeout = window.setTimeout(() => {
    popup.classList.remove("show");
  }, 4000);
}

function requireAuth() {
  if (!token()) {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "index.html";
}

async function submitLogin(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    showMessage(error.detail || "Login failed.");
    return;
  }

  const result = await response.json();
  localStorage.setItem("access_token", result.access_token);
  window.location.href = "dashboard.html";
}

async function submitRegister(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  if (data.password !== data.confirm_password) {
    showMessage("Passwords do not match.");
    return;
  }
  delete data.confirm_password;

  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    showMessage(error.detail || "Registration failed.");
    return;
  }

  window.location.href = "login.html?registered=1";
}

async function uploadDocument(event) {
  event.preventDefault();
  const form = event.target;
  const file = form.querySelector('input[type="file"]').files[0];
  if (!file) {
    showPopup("Select an image or PDF first.");
    return;
  }

  const response = await fetch(`${API_BASE}/api/documents/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: (() => {
      const body = new FormData();
      body.append("file", file);
      return body;
    })(),
  });

  if (response.status === 401) {
    logout();
    return;
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showPopup(result.detail || "Upload failed.");
    return;
  }

  showPopup(
    `${result.filename} uploaded and ${result.tables_detected} table(s) extracted successfully.`,
    "success"
  );
  form.reset();
  document.getElementById("selectedFile").textContent = "Choose a file or drag it here";
}

async function loadDocuments() {
  requireAuth();
  const tableBody = document.getElementById("documentsBody");
  if (!tableBody) return;

  const response = await fetch(`${API_BASE}/api/documents/`, {
    headers: authHeaders(),
  });
  if (response.status === 401) {
    logout();
    return;
  }
  if (!response.ok) {
    showMessage("Could not load your documents.");
    return;
  }

  const documents = await response.json();
  document.getElementById("documentCount").textContent = documents.length;
  if (!documents.length) {
    tableBody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No documents uploaded yet.</div></td></tr>`;
    return;
  }
  tableBody.innerHTML = documents.map((document) => `
    <tr>
      <td class="fw-semibold">${escapeHtml(document.filename)}</td>
      <td><span class="badge text-bg-light">${document.file_type.toUpperCase()}</span></td>
      <td><span class="badge text-bg-success">${escapeHtml(document.status)}</span></td>
      <td>${new Date(document.created_at).toLocaleString()}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-secondary me-1" onclick="viewTables(${document.id})">View</button>
        <button class="btn btn-sm btn-outline-success me-1" onclick="downloadExport(${document.id}, 'xlsx')">XLSX</button>
        <button class="btn btn-sm btn-outline-success me-1" onclick="downloadExport(${document.id}, 'csv')">CSV</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteDocument(${document.id})">Delete</button>
      </td>
    </tr>
  `).join("");
}

async function extractDocument(id) {
  const response = await fetch(`${API_BASE}/api/documents/${id}/extract`, {
    method: "POST",
    headers: authHeaders(),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    showMessage(result.detail || "Could not extract tables.");
    return;
  }
  showMessage(`${result.tables_detected} table(s) extracted.`, "success");
  loadDocuments();
}

async function viewTables(id) {
  const response = await fetch(`${API_BASE}/api/documents/${id}/tables`, {
    headers: authHeaders(),
  });
  const tables = await response.json().catch(() => []);
  if (!response.ok) {
    showMessage(tables.detail || "Could not load extracted tables.");
    return;
  }
  if (!tables.length) {
    showMessage("No extracted tables found.", "info");
    return;
  }

  const content = document.getElementById("tableViewContent");
  content.innerHTML = tables.map((table) => `
    <section class="mb-4">
      <h6 class="fw-bold">Table ${table.table_number}</h6>
      <div class="table-responsive border rounded">
        <table class="table table-sm table-striped align-middle mb-0">
          <tbody>
            ${table.data.map((row) => `
              <tr>${row.map((cell) => `<td class="extracted-cell">${escapeHtml(cell)}</td>`).join("")}</tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `).join("");

  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("tableViewModal")
  ).show();
}

async function downloadExport(id, format) {
  const response = await fetch(`${API_BASE}/api/documents/${id}/export?format=${format}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    showMessage(result.detail || "Could not export tables.");
    return;
  }
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `document-${id}.${format}`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function deleteDocument(id) {
  if (!window.confirm("Delete this document?")) return;
  const response = await fetch(`${API_BASE}/api/documents/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    showMessage("Could not delete the document.");
    return;
  }
  loadDocuments();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[character]));
}

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const selectedFile = document.getElementById("selectedFile");
  if (fileInput && selectedFile) {
    fileInput.addEventListener("change", () => {
      selectedFile.textContent = fileInput.files[0]?.name || "Choose a file or drag it here";
    });
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("registered") === "1") showMessage("Registration successful. Please log in.", "success");
});
