/**
 * drag.js
 * This file contains the JavaScript for implementing the drag movement functionality of the TODO items.
 */

import { loadTodos, saveTodos } from "./storage.js";

// Variable declarations
let selectedElement = null;
let isDragging = false;
let mouseY;

// Increment the z-index to ensure the last moved element is always on top.
// This also maintains the stacking order based on the order in which elements were touched.
let zIndexCounter = 1;

// Execute on page load
document.addEventListener("DOMContentLoaded", initialize);

// Execute the initialization process when todos are rendered.
document.addEventListener("appRendered", initialize);

// Initialization function
function initialize() {
  const todos = document.querySelectorAll(".handle");
  todos.forEach((todo) => {
    todo.addEventListener("mousedown", selectElement);
    todo.addEventListener("touchstart", selectElement);
    todo.addEventListener("touchmove", moveElement);
    todo.addEventListener("touchend", deselectElement);
  });
}

// Element selection function
function selectElement(event) {
  if (
    event.target.matches(".delete-button") ||
    event.target.matches(".add-child-button") ||
    event.target.matches('input[type="checkbox"]') ||
    event.target.matches(".text") ||
    event.target.matches(".edit")
  ) {
    // do nothing
  } else {
    event.preventDefault();
    isDragging = true;
    selectedElement = event.currentTarget;
    mouseY = event.clientY || event.touches[0].clientY;
    selectedElement.dataset.offsetY = selectedElement.dataset.offsetY || 0;
    document.addEventListener("mousemove", moveElement);
    document.addEventListener("mouseup", deselectElement);
    document.addEventListener("touchmove", moveElement);
    document.addEventListener("touchend", deselectElement);
  }
}

// Element movement function
function moveElement(event) {
  if (isDragging) {
    const clientY = event.clientY || event.touches[0].clientY;
    const deltaY = clientY - mouseY;
    selectedElement.dataset.offsetY =
      parseFloat(selectedElement.dataset.offsetY) + deltaY;
    selectedElement.style.transform = `translate(0px, ${selectedElement.dataset.offsetY}px)`;
    selectedElement.style.zIndex = zIndexCounter++;
    mouseY = clientY;
  }
}

// Element deselection function
function deselectElement() {
  isDragging = false;
  document.removeEventListener("mousemove", moveElement);
  document.removeEventListener("mouseup", deselectElement);
  document.removeEventListener("touchmove", moveElement);
  document.removeEventListener("touchmove", moveElement);

  setLocalStorage();

  const dragCustomEvent = new CustomEvent("dragCustomEvent");
  document.dispatchEvent(dragCustomEvent);
}

// Set element order
function setLocalStorage() {
  const newOrder = getNewOrder();
  let todos = (() => {
    try {
      return JSON.parse(loadTodos("todos")) || [];
    } catch (e) {
      console.log(e);
      return [];
    }
  })();

  const updatedTodos = newOrder.map((newOrderItem) => {
    const updatedTodo = todos.find(
      (todo) => String(todo.id) === newOrderItem.id
    );
    return updatedTodo;
  });

  saveTodos("todos", JSON.stringify(updatedTodos));
}

// Get new element order on display
function getNewOrder() {
  const taskList = document.getElementById("todo-list");
  const children = Array.from(taskList.children);
  let newOrder = [];

  children.sort((a, b) => {
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();

    return rectA.top - rectB.top;
  });

  children.forEach((task) => {
    const taskId = task.dataset.id;

    newOrder.push({
      id: taskId,
    });
  });

  return newOrder;
}
