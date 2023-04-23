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
