export function loadTodos(id) {
  try {
      return JSON.parse(localStorage.getItem(id)) || [];
  } catch (e) {
      return [];
  }
}

export function saveTodos(id, list) {
  localStorage.setItem(id, JSON.stringify(list));
}

// save button; save current displayed data to backup of localStorage
const saveBtn = document.querySelector('.saveBtn');
saveBtn.addEventListener('click', function(event) {
  const data = loadTodos('todos')
  saveTodos('backup', data);
});

// load button; load backup of localStorage to display
const loadBtn = document.querySelector('.loadBtn');
loadBtn.addEventListener('click', function(event){
  const backup = loadTodos('backup')
  saveTodos('todos', backup)

  const storageCustomEvent = new CustomEvent('storageCustomEvent');
  document.dispatchEvent(storageCustomEvent);
});
