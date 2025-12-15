/* script.js — simple frontend-only library management
   - Stores books in localStorage under key 'elib_books'
   - Simple login (admin / 1234) stored in session via localStorage 'elib_user'
   - Theme saved at 'elib_theme' ('light'|'dark')
*/

const LS_BOOKS = "elib_books";
const LS_USER = "elib_user";
const LS_THEME = "elib_theme";

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
function setUser(u) {
  if (u) localStorage.setItem(LS_USER, u);
  else localStorage.removeItem(LS_USER);
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
  const form = document.getElementById("loginForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    doLogin();
  });
  document.getElementById("username").focus();
}
function doLogin() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();
  const err = document.getElementById("loginError");
  // simple validation
  if (!u || !p) {
    err.style.display = "block";
    err.textContent = "Enter username and password";
    return;
  }
  if (u === "admin" && p === "1234") {
    setUser("admin"); // redirect
    // small success animation
    const btn = document.getElementById("loginBtn");
    btn.disabled = true;
    btn.textContent = "Logging in...";
    setTimeout(() => {
      location.href = "dashboard.html";
    }, 600);
  } else {
    err.style.display = "block";
    err.textContent = "Invalid credentials";
  }
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
  document
    .getElementById("addBookBtn")
    .addEventListener("click", openAddBookModal);
  document.getElementById("modalClose").addEventListener("click", closeModal);
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
