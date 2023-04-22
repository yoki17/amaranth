/**
 * app.js
 * This file is the main JavaScript file for the TODO list app.
 * It implements basic operations of the app such as adding, deleting, and editing.
 */

// import { loadTodos, saveTodos } from './storage.js';

// DOM elements
const form = document.querySelector('#app form');
const input = document.querySelector('#input');
const todoList = document.querySelector('#todo-list');
const addChildModal = document.querySelector('#addChildModal');
const addChildBtn = document.querySelector('#addChildBtn');
const childInput = document.querySelector('#childInput');
const closeBtn = document.querySelector('.close');

let selectedLi = null;
let selectedTodo = null;

// Retrieve todos from local storage or initialize with an empty array
const todos = (() => {
    try {
        return JSON.parse(localStorage.getItem('todos')) || [];
    } catch (e) {
        return [];
    }
})();

// Render the todos
function render() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = createTodoElement(todo, index);
        todoList.appendChild(li);
    });
    localStorage.setItem('todos', JSON.stringify(todos));

    const todosRenderedEvent = new CustomEvent('todosRendered');
    document.dispatchEvent(todosRenderedEvent);
}

function createCheckbox(todo) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.checked;
    checkbox.addEventListener('change', toggleChecked);
    return checkbox;
}

function createText(todo) {
    const span = document.createElement('span');
    span.textContent = todo.text;
    span.classList.add('text');
    if (todo.checked) {
        span.classList.add('checked');
    }
    span.addEventListener('dblclick', editTodo);
    span.addEventListener('touchstart', editTodo);
    return span;
}

function createEditInput(todo) {
    const editInput = document.createElement('textarea');
    editInput.value = todo.text;
    editInput.classList.add('edit');
    editInput.addEventListener('blur', endEditing);
    editInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault();
            event.target.blur();
        }
    });
    return editInput;
}

function createDeleteButton() {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', deleteTodo);
    deleteButton.addEventListener('touchstart', deleteTodo);
    return deleteButton;
}

function createAddChildButton() {
    const addChildButton = document.createElement('button');
    addChildButton.textContent = 'Add Subtask';
    addChildButton.classList.add('add-child-button');
    addChildButton.addEventListener('click', addChild);
    addChildButton.addEventListener('touchstart', addChild);
    return addChildButton;
}

function createTodoElement(todo, index, isChild = false, parentIndex = null) {
    const li = document.createElement('li');
    const checkbox = createCheckbox(todo);
    const span = createText(todo);
    const editInput = createEditInput(todo);
    const deleteButton = createDeleteButton();
    const addChildButton = createAddChildButton();
    const childList = createChildList(todo, parentIndex);

    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(addChildButton);
    buttonContainer.classList.add('task-button');

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editInput);
    li.appendChild(buttonContainer);
    li.appendChild(childList);
    li.classList.add('handle');

    if (isChild) {
        li.setAttribute('data-child-index', index);
        li.setAttribute('data-parent-index', parentIndex);
    } else {
        li.setAttribute('data-index', index);
    }
    li.setAttribute('data-id', todo.id);

    return li;
}

function createChildList(todo, parentIndex = null) {
    const childList = document.createElement('ul');
    todo.children.forEach((child, index) => {
        let childParentIndex;
        if (parentIndex === null) {
            childParentIndex = index;
        } else {
            childParentIndex = parentIndex;
        }
        const childLi = createTodoElement(child, index, true, childParentIndex);
        childList.appendChild(childLi);
    });
    return childList;
}

// Other helper functions
function addTodo(text, parentId = null) {
    const todo = {
        id: Date.now(),
        text,
        checked: false,
        children: []
    };

    if (parentId !== null) {
        const parentTodo = findTodo(parseInt(parentId));
        parentTodo.children.push(todo);
    } else {
        todos.push(todo);
    }

    render();
}

function deleteTodo(event) {
    const deleteButton = event.target;
    const li = deleteButton.closest('li');
    const todoId = parseInt(li.getAttribute('data-id'));

    function removeTodoById(todosList, id) {
        const index = todosList.findIndex(todo => todo.id === id);
        if (index !== -1) {
            todosList.splice(index, 1);
            return true;
        }

        for (let i = 0; i < todosList.length; i++) {
            if (removeTodoById(todosList[i].children, id)) {
                return true;
            }
        }

        return false;
    }

    removeTodoById(todos, todoId);
    render();
}

function toggleChecked(event) {
    const li = event.target.parentElement;
    const todoId = parseInt(li.getAttribute('data-id'));

    // Toggles the checked state of the specified todo item and its children recursively
    function toggleTodoAndChildrenChecked(todosList, id) {
        for (const todo of todosList) {
            if (todo.id === id) {
                todo.checked = !todo.checked;
                toggleAllChildrenChecked(todo.children, todo.checked);
                return true;
            }
            if (todo.children.length > 0 && toggleTodoAndChildrenChecked(todo.children, id)) {
                return true;
            }
        }
        return false;
    }

    // Toggles the checked state of all children items recursively
    function toggleAllChildrenChecked(children, checked) {
        children.forEach(child => {
            child.checked = checked;
            if (child.children.length > 0) {
                toggleAllChildrenChecked(child.children, checked);
            }
        });
    }

    // Call the main function to toggle the checked state
    toggleTodoAndChildrenChecked(todos, todoId);
    render();
}


function editTodo(event) {
    const li = event.target.parentElement;
    const editInput = li.querySelector('.edit');
    editInput.style.display = 'block';
    editInput.focus();
}

// This function is called when the editing of a todo item is finished.
// It updates the todo item's text and re-renders the list.
function endEditing(event) {
    const li = event.target.parentElement;
    const todoId = parseInt(li.getAttribute('data-id'));

    updateTodoText(todos, todoId, event.target.value);
    render();
}

// This function updates the text of a todo item with the given ID.
// It searches the todosList recursively to find the target todo item and updates its text.
function updateTodoText(todosList, id, newText) {
    for (const todo of todosList) {
        if (todo.id === id) {
            todo.text = newText;
            return true;
        }
        if (todo.children.length > 0) {
            if (updateTodoText(todo.children, id, newText)) {
                return true;
            }
        }
    }
    return false;
}

function addChild(event) {
    const deleteButton = event.target;
    const li = deleteButton.closest('li');
    selectedLi = li;
    selectedTodo = li.getAttribute('data-id');
    addChildPrompt();
}

function addChildPrompt() {
    addChildModal.style.display = 'block';
    childInput.value = '';
}

function findTodo(targetId, todosList = todos) {
    for (const todo of todosList) {
        if (todo.id === targetId) {
            return todo;
        }
        if (todo.children.length > 0) {
            const foundTodo = findTodo(targetId, todo.children);
            if (foundTodo) {
                return foundTodo;
            }
        }
    }
    return null;
}

// Event listeners
form.addEventListener('submit', function (event) {
    event.preventDefault();
    const text = input.value;
    addTodo(text);
    input.value = '';
});

input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        addTodo(input.value);
        input.value = '';
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && addChildModal.style.display === 'block') {
        addChildModal.style.display = 'none';
    }
});

addChildBtn.addEventListener('click', function() {
    addTodo(childInput.value, selectedTodo);
    childInput.value = '';
    addChildModal.style.display = 'none';
});

addChildBtn.addEventListener('touchstart', function() {
    addTodo(childInput.value, selectedTodo);
    childInput.value = '';
    addChildModal.style.display = 'none';
});

closeBtn.addEventListener('click', function () {
    addChildModal.style.display = 'none';
});

closeBtn.addEventListener('touchstart', function () {
    addChildModal.style.display = 'none';
});

childInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        addTodo(childInput.value, selectedTodo);
        childInput.value = '';
        addChildModal.style.display = 'none';
    }
});

// Initial render
render();