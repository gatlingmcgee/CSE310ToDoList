// Array to store tasks
let todos = [];

// DOM elements
const input = document.getElementById("todoInput");
const button = document.getElementById("button");
const list = document.getElementById("todoList");
const { DateTime } = luxon;

// Load tasks from localStorage
const storedTodos = localStorage.getItem("todos");
if (storedTodos) {
    todos = JSON.parse(storedTodos).map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        deadline: todo.deadline ? new Date(todo.deadline) : null
    }));
    renderTodos();
}

// Save any tasks to localStorage
function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Create new task button
button.addEventListener("click", () => {
    try {
        addTodo();
    } catch (error) {
        console.error("Error adding todo:", error);
        alert("Could not add task. Please see console for details.");
    }
});

// Add new task
function addTodo() {
    const text = input.value.trim();

    // Confirm task is entered
    if (!text) {
        alert("Please enter a task before submitting.");
        return;
    }

    // Confirm task date is a future date
    const deadlineValue = deadlineInput.value;
    let deadline = null;

    if (deadlineValue) {
        deadline = new Date(deadlineValue);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (deadline < today) {
            alert("Deadline cannot be in the past. Please select a valid date.");
            return;
        }
    }

    // Creates a unique ID for each task
    try {
        const todo = {
            id: "todo_" + Date.now(),
            text: text,
            completed: false,
            deadline: deadline
        };

        // Save task to local storage
        todos = [...todos, todo];
        saveTodos();
    } catch (error) {
        console.error("Failed to add todo:", error);
        throw error;
    }

    // Clears input fields
    input.value = "";
    deadlineInput.value = "";
    renderTodos();
}

// Render all todos recursively
function renderTodos() {

    // Clear current list to prevemt duplicates
    list.innerHTML = "";
    // Start recursive rendering at index 0
    renderTodoRecursive(0);
}

function renderTodoRecursive(index) {
    // Stops recursion when all tasks are processed - base case
    if (index >= todos.length) return;

    const todo = todos[index];
    // Skip invalid task entries
    if (!todo || !todo.id) return renderTodoRecursive(index + 1);

    // Creates list item
    const li = document.createElement("li");

    if (todo.editing) {
        // Edit a task
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = todo.text;

        editInput.addEventListener("keydown", (e) => {
            // Commit edit
            if (e.key === "Enter") {
                saveEdit(todo.id, editInput.value);
            }
            // Cancel edit
            if (e.key === "Escape") {
                cancelEdit(todo.id);
            }
        });

        // Keeps the edit functionality clean if you click outside the input
        editInput.addEventListener("blur", () => cancelEdit(todo.id));

        li.appendChild(editInput);
        editInput.focus();
    } else {
        // Display a task
        // Format dates using Luxon
        const deadlineStr = todo.deadline
            ? DateTime.fromJSDate(todo.deadline).toLocaleString(DateTime.DATE_MED)
            : "No deadline";

        // create task text span
        const textSpan = document.createElement("span");
        textSpan.textContent = `${todo.text} (Deadline: ${deadlineStr})`;

        // shows completed tasks with strikethrough
        if (todo.completed) textSpan.classList.add("completed");

        // Single click ro toggle completed
        textSpan.addEventListener("click", () => toggleTodo(todo.id));

        // Double click to edit task on list
        textSpan.addEventListener("dblclick", () => startEdit(todo.id));

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // prevent toggle
            deleteTodo(todo.id);
        });

        li.appendChild(textSpan);
        li.appendChild(deleteBtn);
    }

    list.appendChild(li);
    renderTodoRecursive(index + 1); // recursive call
}

// Implement strike through for completed tasks using ES6 map
function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    // Saves task
    saveTodos();
    renderTodos();
}

// Delete task using ES6 filter
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    // Saves deleted task
    saveTodos(); // save tasks
    renderTodos();
}

// Edit task using ES6 map
function startEdit(id) {
    // Sets to true for edit
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, editing: true } : todo
    );
    renderTodos();
}

// Saves edited task
function saveEdit(id, newText) {
    if (!newText.trim()) return;

    // Updates task text and sets edit to false
    todos = todos.map(todo =>
        todo.id === id
            ? { ...todo, text: newText.trim(), editing: false }
            : todo
    );
    saveTodos();
    renderTodos();
}

// Cancels edit without saving
function cancelEdit(id) {
    // Reset edit to false without saving (undo)
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, editing: false } : todo
    );
    renderTodos();
}
