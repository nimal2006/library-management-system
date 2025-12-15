/* script.js — simple frontend-only library management
   - Stores books in localStorage under key 'elib_books'
   - Supports admin and user login with different permissions
   - Theme saved at 'elib_theme' ('light'|'dark')
*/

const LS_BOOKS = "elib_books";
const LS_USER = "elib_user";
const LS_ROLE = "elib_role"; // 'admin' or 'user'
const LS_THEME = "elib_theme";
const LS_CUSTOM_USERS = "elib_custom_users"; // Custom registered users

// Built-in admin account (full access)
const ADMIN_ACCOUNT = { password: "admin123", role: "admin" };

// Load custom users from localStorage
function loadCustomUsers() {
  const raw = localStorage.getItem(LS_CUSTOM_USERS);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

// Save custom users to localStorage
function saveCustomUsers(users) {
  localStorage.setItem(LS_CUSTOM_USERS, JSON.stringify(users));
}

// Register a new user
function registerUser(username, password) {
  const users = loadCustomUsers();
  if (users[username] || username === "admin") {
    return { success: false, message: "Username already exists" };
  }
  users[username] = { password: password, role: "user" };
  saveCustomUsers(users);
  return { success: true, message: "Account created successfully!" };
}

// Sample seed data
const SAMPLE_BOOKS = [
  {
    id: "B-101",
    title: "Introduction to Java",
    author: "K. Thomas",
    total: 5,
    available: 5,
  },
  {
    id: "B-102",
    title: "Data Structures",
    author: "S. Yadav",
    total: 4,
    available: 4,
  },
  {
    id: "B-103",
    title: "Operating Systems",
    author: "A. Tanenbaum",
    total: 3,
    available: 3,
  },
  {
    id: "B-104",
    title: "Computer Networks",
    author: "J. Kurose",
    total: 2,
    available: 2,
  },
  {
    id: "B-105",
    title: "Database Systems",
    author: "R. Elmasri",
    total: 6,
    available: 6,
  },
];

/* ------------------- Storage helpers ------------------- */
function loadBooks() {
  const raw = localStorage.getItem(LS_BOOKS);
  if (!raw) {
    localStorage.setItem(LS_BOOKS, JSON.stringify(SAMPLE_BOOKS));
    return SAMPLE_BOOKS.slice();
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    localStorage.setItem(LS_BOOKS, JSON.stringify(SAMPLE_BOOKS));
    return SAMPLE_BOOKS.slice();
  }
}
function saveBooks(list) {
  localStorage.setItem(LS_BOOKS, JSON.stringify(list));
}

function getUser() {
  return localStorage.getItem(LS_USER);
}
function getRole() {
  return localStorage.getItem(LS_ROLE) || "user";
}
function setUser(u, role) {
  if (u) {
    localStorage.setItem(LS_USER, u);
    localStorage.setItem(LS_ROLE, role || "user");
  } else {
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_ROLE);
  }
}
function isAdmin() {
  return getRole() === "admin";
}

/* ------------------- Theme ------------------- */
function applyTheme(t) {
  document.documentElement.setAttribute(
    "data-theme",
    t === "dark" ? "dark" : "light"
  );
  localStorage.setItem(LS_THEME, t);
}
function initTheme() {
  const t = localStorage.getItem(LS_THEME) || "light";
  applyTheme(t);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme");
  applyTheme(cur === "dark" ? "light" : "dark");
}

/* ------------------- Login Page ------------------- */
function initLoginPage() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const toggleBtn = document.getElementById("toggleAuth");
  const toggleText = document.getElementById("toggleText");

  if (!loginForm) return;

  // Login form submit
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    doLogin();
  });

  // Register form submit
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      doRegister();
    });
  }

  // Toggle between login and register
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isLoginVisible = loginForm.style.display !== "none";
      if (isLoginVisible) {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        toggleBtn.textContent = "Sign In";
        toggleText.textContent = "Already have an account?";
      } else {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        toggleBtn.textContent = "Sign Up";
        toggleText.textContent = "Don't have an account?";
      }
      // Clear errors
      document.getElementById("loginError").style.display = "none";
      document.getElementById("registerError").style.display = "none";
      document.getElementById("registerSuccess").style.display = "none";
    });
  }

  document.getElementById("username").focus();
}

function doRegister() {
  const u = document.getElementById("regUsername").value.trim().toLowerCase();
  const p = document.getElementById("regPassword").value.trim();
  const c = document.getElementById("regConfirm").value.trim();
  const err = document.getElementById("registerError");
  const success = document.getElementById("registerSuccess");

  err.style.display = "none";
  success.style.display = "none";

  if (!u || !p || !c) {
    err.style.display = "block";
    err.textContent = "Please fill in all fields";
    return;
  }
  if (u.length < 3) {
    err.style.display = "block";
    err.textContent = "Username must be at least 3 characters";
    return;
  }
  if (p.length < 4) {
    err.style.display = "block";
    err.textContent = "Password must be at least 4 characters";
    return;
  }
  if (p !== c) {
    err.style.display = "block";
    err.textContent = "Passwords do not match";
    return;
  }

  const result = registerUser(u, p);
  if (result.success) {
    success.style.display = "block";
    success.textContent = result.message + " You can now sign in.";
    // Clear form
    document.getElementById("regUsername").value = "";
    document.getElementById("regPassword").value = "";
    document.getElementById("regConfirm").value = "";
  } else {
    err.style.display = "block";
    err.textContent = result.message;
  }
}

function doLogin() {
  const u = document.getElementById("username").value.trim().toLowerCase();
  const p = document.getElementById("password").value.trim();
  const err = document.getElementById("loginError");
  // simple validation
  if (!u || !p) {
    err.style.display = "block";
    err.textContent = "Enter username and password";
    return;
  }
  // Check admin account first
  if (u === "admin" && p === ADMIN_ACCOUNT.password) {
    setUser(u, "admin");
    loginSuccess();
    return;
  }

  // Check custom registered users
  const customUsers = loadCustomUsers();
  const account = customUsers[u];
  if (account && account.password === p) {
    setUser(u, account.role);
    loginSuccess();
  } else {
    err.style.display = "block";
    err.textContent = "Invalid username or password";
  }
}

function loginSuccess() {
  const btn = document.getElementById("loginBtn");
  btn.disabled = true;
  btn.textContent = "Logging in...";
  setTimeout(() => {
    location.href = "dashboard.html";
  }, 600);
}

/* ------------------- Auth helpers ------------------- */
function requireAuth() {
  if (!getUser()) location.href = "index.html";
}
function initLogoutButtons() {
  const l = document.querySelectorAll("#logoutBtn, #logoutBtn2");
  l.forEach(
    (el) =>
      el &&
      el.addEventListener("click", () => {
        setUser(null);
      })
  );
}

/* ------------------- Dashboard ------------------- */
function renderDashboard() {
  const books = loadBooks();
  const total = books.reduce((s, b) => s + b.total, 0);
  const available = books.reduce((s, b) => s + b.available, 0);
  const issued = total - available;
  animateCount("totalBooks", total);
  animateCount("issuedBooks", issued);
  animateCount("availableBooks", available);
  // Update user role display
  updateUserRoleDisplay();
}

function updateUserRoleDisplay() {
  const roleEl = document.getElementById("userRole");
  const userEl = document.getElementById("userName");
  const welcomeEl = document.getElementById("welcomeName");
  const username = getUser() || "Guest";
  const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);
  
  if (roleEl) {
    const role = getRole();
    roleEl.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    roleEl.className = "role-badge role-" + role;
  }
  if (userEl) {
    userEl.textContent = capitalizedName;
  }
  if (welcomeEl) {
    welcomeEl.textContent = capitalizedName;
  }
}

function animateCount(id, to) {
  const el = document.getElementById(id);
  if (!el) return;
  const from = Number(el.textContent) || 0;
  const dur = 700;
  const start = performance.now();
  requestAnimationFrame(function step(ts) {
    const t = Math.min(1, (ts - start) / dur);
    const val = Math.round(from + (to - from) * easeOutCubic(t));
    el.textContent = val;
    if (t < 1) requestAnimationFrame(step);
  });
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ------------------- Books Page ------------------- */
function initBooksPage() {
  renderBooksTable();
  const addBtn = document.getElementById("addBookBtn");
  // Only admin can add books
  if (!isAdmin()) {
    addBtn.style.display = "none";
  } else {
    addBtn.addEventListener("click", openAddBookModal);
  }
  document.getElementById("modalClose").addEventListener("click", closeModal);
  // Update user role display if element exists
  updateUserRoleDisplay();
}

function renderBooksTable() {
  const tbody = document.querySelector("#booksTable tbody");
  if (!tbody) return;
  const books = loadBooks();
  tbody.innerHTML = "";
  books.forEach((b) => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td>${b.id}</td><td>${escapeHtml(b.title)}</td><td>${escapeHtml(
        b.author
      )}</td><td>${b.total}</td><td>${b.available}</td><td>` +
      `<button class="btn" data-action="issue" data-id="${b.id}">${
        b.available > 0 ? "Issue" : "No copies"
      }</button> ` +
      `<button class="btn" data-action="return" data-id="${b.id}">Return</button></td>`;
    tbody.appendChild(tr);
  });
  // attach handlers
  tbody.querySelectorAll("button[data-action]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      const act = e.currentTarget.getAttribute("data-action");
      if (act === "issue") issueBook(id);
      else returnBook(id);
    })
  );
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function issueBook(bookId) {
  const books = loadBooks();
  const b = books.find((x) => x.id === bookId);
  if (!b) return;
  if (b.available <= 0) {
    alert("No copies available");
    return;
  }
  const member = prompt("Enter Member ID or name to issue to:", "M-001");
  if (!member) return;
  b.available--;
  saveBooks(books);
  renderBooksTable();
  renderDashboard();
  flashInfo("Book issued");
}

function returnBook(bookId) {
  const books = loadBooks();
  const b = books.find((x) => x.id === bookId);
  if (!b) return;
  if (b.available >= b.total) {
    alert("All copies already present");
    return;
  }
  b.available++;
  saveBooks(books);
  renderBooksTable();
  renderDashboard();
  flashInfo("Book returned");
}

function openAddBookModal() {
  const body = document.getElementById("modalBody");
  body.innerHTML = `<h3>Add Book</h3>
  <div class="field"><label>Title</label><input id="nbTitle"></div>
  <div class="field"><label>Author</label><input id="nbAuthor"></div>
  <div class="field"><label>Total copies</label><input id="nbTotal" type="number" value="1" min="1"></div>
  <div style="text-align:right"><button id="addBookSave" class="btn btn-primary">Save</button></div>`;
  showModal();
  document.getElementById("addBookSave").addEventListener("click", () => {
    const title = document.getElementById("nbTitle").value.trim();
    const author = document.getElementById("nbAuthor").value.trim();
    const total = Math.max(
      1,
      parseInt(document.getElementById("nbTotal").value || 1)
    );
    if (!title) {
      alert("Enter title");
      return;
    }
    const books = loadBooks();
    const id = "B-" + Date.now();
    books.push({ id, title, author, total, available: total });
    saveBooks(books);
    closeModal();
    renderBooksTable();
    renderDashboard();
  });
}

function showModal() {
  const m = document.getElementById("modal");
  m.setAttribute("aria-hidden", "false");
}
function closeModal() {
  const m = document.getElementById("modal");
  m.setAttribute("aria-hidden", "true");
}

function flashInfo(msg) {
  const t = document.createElement("div");
  t.className = "card glass";
  t.style.position = "fixed";
  t.style.right = "20px";
  t.style.bottom = "20px";
  t.style.padding = "10px 14px";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.transition = "opacity .6s";
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 700);
  }, 1200);
}

/* ------------------- Boot ------------------- */
function boot() {
  initTheme();
  initLogoutButtons();
  const page = document.body.className;
  if (page.includes("page-login")) {
    initLoginPage();
  }
  if (page.includes("page-dashboard")) {
    requireAuth();
    renderDashboard();
    document
      .getElementById("themeToggle")
      .addEventListener("click", toggleTheme);
  }
  if (page.includes("page-books")) {
    requireAuth();
    initBooksPage();
    document
      .getElementById("themeToggleTop")
      .addEventListener("click", toggleTheme);
  }
}

document.addEventListener("DOMContentLoaded", boot);
