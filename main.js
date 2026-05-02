// ── State ──
let todoSaved = JSON.parse(localStorage.getItem("todos") || "[]");
let todoEditing = { id: null };

// ── DOM refs ──
const todoForm       = document.getElementById("todoForm");
const titleEl        = document.getElementById("title");
const descEl         = document.getElementById("description");
const btnAdd         = document.getElementById("btn-add");
const btnReset       = document.getElementById("btn-reset");
const taskList       = document.getElementById("taskList");
const taskCountEl    = document.getElementById("taskCount");
const formCard       = document.querySelector(".form-card");

// ── Helpers ──
function generateId(n = 6, prefix = "task-") {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = prefix;
    for (let i = 0; i < n; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

function validate(todo) {
    if (!todo.title.trim() || !todo.description.trim()) {
        alert("Vui lòng nhập đầy đủ title và description!");
        return false;
    }
    return true;
}

function save() {
    localStorage.setItem("todos", JSON.stringify(todoSaved));
}

// ── Render ──
function render(todos) {
    taskList.innerHTML = "";

    // Update counter
    const total = todos.length;
    const done  = todos.filter(t => t.status).length;
    taskCountEl.textContent = total === 0 ? "0 tasks" : `${done}/${total} done`;

    if (todos.length === 0) {
        taskList.innerHTML = `
            <div class="task-empty">
                <span class="empty-icon">📋</span>
                Nothing to do — add your first task!
            </div>`;
        return;
    }

    todos.forEach(item => {
        const card = document.createElement("div");
        card.className = `task-card ${item.status ? "is-done" : ""}`;
        card.innerHTML = `
            <div class="task-check" onclick="toggleStatus('${item.id}')">
                ${item.status ? "✓" : ""}
            </div>
            <div class="task-content">
                <div class="task-title">${escHtml(item.title)}</div>
                <div class="task-desc">${escHtml(item.description)}</div>
                <div class="task-id">${item.id}</div>
            </div>
            <div class="task-actions">
                <button class="icon-btn edit" onclick="updateTodo('${item.id}')" title="Edit">✎</button>
                <button class="icon-btn del"  onclick="removeTodo('${item.id}')"  title="Delete">✕</button>
            </div>
        `;
        taskList.appendChild(card);
    });

    save();
}

function escHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ── Form submit ──
todoForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const title       = titleEl.value.trim();
    const description = descEl.value.trim();

    if (todoEditing.id) {
        // Edit mode
        const updated = { ...todoEditing, title, description };
        if (!validate(updated)) return;
        todoSaved = todoSaved.map(t => t.id === todoEditing.id ? updated : t);
    } else {
        // Add mode
        const todo = { id: generateId(), title, description, status: false };
        if (!validate(todo)) return;
        todoSaved.push(todo);
    }

    render(todoSaved);
    resetForm();
});

// ── Actions ──
function toggleStatus(id) {
    todoSaved = todoSaved.map(t => t.id === id ? { ...t, status: !t.status } : t);
    render(todoSaved);
}

function removeTodo(id) {
    todoSaved = todoSaved.filter(t => t.id !== id);
    render(todoSaved);
}

function removeAll() {
    if (todoSaved.length === 0) return;
    if (!confirm("Xóa tất cả task?")) return;
    todoSaved = [];
    render(todoSaved);
}

function updateTodo(id) {
    todoEditing = todoSaved.find(t => t.id === id);
    titleEl.value = todoEditing.title;
    descEl.value  = todoEditing.description;
    btnAdd.innerHTML = `<span class="btn-icon">✓</span> Save Changes`;
    formCard.classList.add("editing");

    // Show editing badge
    const existing = formCard.querySelector(".editing-badge");
    if (!existing) {
        const badge = document.createElement("div");
        badge.className = "editing-badge";
        badge.textContent = "✎ Editing task";
        formCard.querySelector(".form-title").after(badge);
    }
    titleEl.focus();
}

function resetForm() {
    todoForm.reset();
    todoEditing = { id: null };
    btnAdd.innerHTML = `<span class="btn-icon">＋</span> Add Task`;
    formCard.classList.remove("editing");
    const badge = formCard.querySelector(".editing-badge");
    if (badge) badge.remove();
}

btnReset.addEventListener("click", resetForm);

// ── Init ──
render(todoSaved);
