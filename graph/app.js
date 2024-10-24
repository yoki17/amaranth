/**
 * app.js
 * This file is the main JavaScript file for the Graph app.
 * It implements basic operations of the app such as adding, deleting, and editing.
 */
import { loadGraphs, saveGraphs } from "./storage.js";

//// 初期レンダリング
function render() {
  createCircle();
  document.querySelector(".tablinks").click();
  generateScheduleItems();
}

//// タブ操作
const tablink1 = document.querySelector(".tablink1");
tablink1.addEventListener("click", function (event) {
  openTab(event, "Tab1");
});
const tablink2 = document.querySelector(".tablink2");
tablink2.addEventListener("click", function (event) {
  openTab(event, "Tab2");
});
const tablink3 = document.querySelector(".tablink3");
tablink3.addEventListener("click", function (event) {
  openTab(event, "Tab3");
});
function openTab(evt, tabName) {
  // すべてのタブコンテンツを非表示にする
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  // すべてのタブボタンの "active" クラスを削除する
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  // 現在のタブを表示し、アクティブなタブボタンをハイライトする
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

//// タブ1のグラフ関係
// グラフの円を動的に生成
const container = document.querySelector(".circle-container");
const numTriangles = 48; // 360度 ÷ 7.5度 = 48個の三角形
const radius = 0; // 三角形の底辺が外側にくるようにする半径
function createCircle() {
  for (let i = 0; i < numTriangles; i++) {
    const angle = i * 7.5 + 3.75; // 角度を2.5度に設定
    const triangle = document.createElement("div");
    triangle.className = "triangle";
    triangle.style.transform = `rotate(${angle}deg) translate(${radius}px)`;
    container.appendChild(triangle);
  }
}

//// タブ2のテーブル関係
// スケジュールアイテムを動的に生成
function generateScheduleItems() {
  var container = document.getElementById("scheduleContainer");
  for (var hour = 0; hour < 24; hour++) {
    var time = hour.toString().padStart(2, "0") + ":00";
    var item = document.createElement("div");
    item.className = "schedule-item";
    item.setAttribute("data-time", time);

    var timeDiv = document.createElement("div");
    timeDiv.className = "time";
    timeDiv.textContent = time;

    var taskDiv = document.createElement("div");
    taskDiv.className = "task";
    taskDiv.textContent = "-";

    item.appendChild(timeDiv);
    item.appendChild(taskDiv);
    container.appendChild(item);
  }
}

var isDragging = false;
var startTime;
var endTime;
var startElement;

// スケジュールアイテムの編集（マウス押下）
document.addEventListener("mousedown", function (event) {
  var scheduleItem = event.target.closest(".schedule-item");
  if (scheduleItem) {
    isDragging = true;
    startElement = scheduleItem;
    startTime = startElement.getAttribute("data-time");
    startElement.classList.add("selected");
    endTime = startTime;
  }
});

// スケジュールアイテムの編集（マウスドラッグ）
document.addEventListener("mousemove", function (event) {
  if (isDragging) {
    var scheduleItems = document.querySelectorAll(".schedule-item");
    var startIndex = Array.from(scheduleItems).indexOf(startElement);
    var endIndex = startIndex;

    scheduleItems.forEach(function (item, index) {
      item.classList.remove("selected");
      var rect = item.getBoundingClientRect();
      if (event.clientY >= rect.top && event.clientY <= rect.bottom) {
        endIndex = index;
      }
    });

    var minIndex = Math.min(startIndex, endIndex);
    var maxIndex = Math.max(startIndex, endIndex);

    for (var i = minIndex; i <= maxIndex; i++) {
      scheduleItems[i].classList.add("selected");
      // 開始時間or終了時間を更新
      if (i === minIndex) {
        startTime = scheduleItems[i].getAttribute("data-time");
      } else {
        endTime = scheduleItems[i].getAttribute("data-time");
      }
    }
  }
});

// スケジュールアイテムの編集（マウス解放）
document.addEventListener("mouseup", function (event) {
  if (isDragging) {
    isDragging = false;
    showEditForm(startTime, endTime);
  }
});

// タスク編集フォームを表示
function showEditForm(startTime, endTime) {
  document.getElementById("startTimeInput").value = startTime;
  document.getElementById("endTimeInput").value = endTime;
  document.getElementById("editForm").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

// 入力したタスクを保存
const saveTask = document.querySelector(".saveTask");
saveTask.addEventListener("click", function (event) {
  var newStartTime = document.getElementById("startTimeInput").value;
  var newEndTime = document.getElementById("endTimeInput").value;
  var newTaskText = document.getElementById("taskInput").value;

  // 選択された範囲のスケジュールアイテムを更新
  var scheduleItems = document.querySelectorAll(".schedule-item");
  var isInRange = false;
  scheduleItems.forEach(function (item) {
    var itemTime = item.getAttribute("data-time");
    if (itemTime === newStartTime) {
      isInRange = true;
    }
    if (isInRange) {
      item.querySelector(".task").textContent = newTaskText;
    }
    if (itemTime === newEndTime) {
      isInRange = false;
    }
  });

  // 編集終了時に選択状態を解除
  scheduleItems.forEach(function (item) {
    item.classList.remove("selected");
  });

  document.getElementById("editForm").style.display = "none";
  document.getElementById("overlay").style.display = "none";

  // 保存するデータを作成
  // ローカルストレージからデータを取得
  let jsonData = (() => {
    try {
      var loadedData = loadGraphs("graphs");
      try {
        loadedData = JSON.parse(loadedData);
        // jsonDataが配列でない場合、空の配列として初期化
        if (!Array.isArray(loadedData)) {
          loadedData = [];
        }
      } catch (e) {
        console.error("初回 or JSONのパースに失敗:", e);
        loadedData = [];
      }
      return loadedData;
    } catch (e) {
      console.error('loadGraphs():'+e);
      return [];
    }
  })();

  // 要素を追加
  jsonData.push({
    startTime: newStartTime,
    endTime: newEndTime,
    task: newTaskText,
  });

  // ローカルストレージに保存
  saveGraphs("graphs", JSON.stringify(jsonData));
});

// タスク入力をキャンセル
const cancelEdit = document.querySelector(".cancelEdit");
const overlay = document.querySelector(".overlay");
cancelEdit.addEventListener("click", function (event) {
  cancelTask();
});
overlay.addEventListener("click", function (event) {
  cancelTask();
});
function cancelTask() {
  document.getElementById("editForm").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  // ドラッグ終了時に選択状態を解除
  var scheduleItems = document.querySelectorAll(".schedule-item");
  scheduleItems.forEach(function (item) {
    item.classList.remove("selected");
  });
}

//// タブ3のLSデータ関係
const saveData = document.querySelector(".saveData");
const loadData = document.querySelector(".loadData");

saveData.addEventListener("click", function (event) {
  const jsonData = document.getElementById("jsonInput").value;

  try {
    JSON.parse(jsonData);
    saveGraphs("graphs", jsonData);
    alert("データが保存されました。");
  } catch (e) {
    alert("無効なJSON形式です。" + e);
  }
});

loadData.addEventListener("click", function (event) {
  const storedData = loadGraphs("graphs");
  if (storedData) {
    document.getElementById("output").textContent = storedData;
  } else {
    document.getElementById("output").textContent =
      "保存されたデータがありません。";
  }
});

// 描画呼び出し
render();
