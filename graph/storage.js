export function loadGraphs(id) {
  try {
      return JSON.parse(localStorage.getItem(id)) || [];
  } catch (e) {
      return [];
  }
}

export function saveGraphs(id, list) {
  localStorage.setItem(id, JSON.stringify(list));
}

// save button; save current displayed data to backup of localStorage
const saveBtn = document.querySelector('.saveBtn');
saveBtn.addEventListener('click', function(event) {
  const data = loadGraphs('graphs')
  saveGraphs('backup', data);
});

// load button; load backup of localStorage to display
const loadBtn = document.querySelector('.loadBtn');
loadBtn.addEventListener('click', function(event){
  const backup = loadGraphs('backup')
  saveGraphs('graphs', backup)

  const storageCustomEvent = new CustomEvent('storageCustomEvent');
  document.dispatchEvent(storageCustomEvent);
});
