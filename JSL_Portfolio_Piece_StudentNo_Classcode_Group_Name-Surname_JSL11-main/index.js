import {
  getTasks,
  createNewTask,
  patchTask,
  deleteTask,
  putTask,
} from "./utils/taskFunctions.js";
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage

function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

initializeData();

const elements = {
  //SIDE-BAR
  sidebar: document.querySelector(".side-bar"),
  sidebarDiv: document.getElementById("side-bar-div"),
  sidelogoDiv: document.getElementById("side-logo-div"),
  boardsContainer: document.getElementById("boards-nav-links-div"),
  sideBarBottom: document.querySelector(".side-bar-bottom"),
  toggleDiv: document.querySelector(".toggle-div"),
  themeSwitch: document.getElementById("switch"),
  labelCheckboxTheme: document.getElementById("label-checkbox-theme"),
  hideSideBarDiv: document.querySelector(".hide-side-bar-div"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),

  //SHOW SIDE-BAR BTN
  showSideBarBtn: document.getElementById("show-side-bar-btn"),

  //MAIN LAYOUT
  layout: document.getElementById("layout"),

  //HEADER
  header: document.getElementById("header"),
  headerNameDiv: document.querySelector(".header-name-div"),
  headerBoardName: document.getElementById("header-board-name"),
  dropdownBtn: document.getElementById("dropdownBtn"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  editBtn: document.getElementById("edit-board-btn"),
  editBoardDiv: document.getElementById("editBoardDiv"),
  deleteBoardBtn: document.getElementById("deleteBoardBtn"),

  //CONTAINER
  container: document.querySelector(".container"),

  //MAIN (contains repititions)
  cardColumnMain: document.querySelector(".card-column-main"),
  columnDiv: document.querySelectorAll(".column-div"),
  tasksContainerAll: document.querySelector(".tasks-container"),

  //TODO
  todoHeadDiv: document.getElementById("todo-head-div"),

  //DOING
  doingHeadDiv: document.getElementById("doing-head-div"),

  //DONE
  doneHeadDiv: document.getElementById("done-head-div"),

  //NEW TASK MODAL (form for creating new a task)
  modalWindow: document.getElementById("new-task-modal-window"),

  //modalWindow: document.getElementById("new-task-modal-window"),
  inputDiv: document.getElementById("input-div"),
  modalTitleInput: document.getElementById("modal-title-input"),
  titleInput: document.getElementById("title-input"),
  modalDescInput: document.getElementById("modal-desc-input"),
  descInput: document.getElementById("desc-input"),
  modalSelectStatus: document.getElementById("modal-select-status"),
  selectStatus: document.getElementById("select-status"),
  btnGroup: document.querySelector(".button-group"),
  createTaskBtn: document.getElementById("create-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),

  //EDIT TASK MODAL (form for editing an exisiting task's details)
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  editTaskForm: document.getElementById("edit-task-form"),
  editTaskHeader: document.getElementById("edit-task-header"),
  editTaskDiv: document.querySelector(".edit-task-div"),
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editBtn: document.getElementById("edit-btn"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  labelModalWindow: document.querySelector(".label-modal-window"),
  editSelectStatus: document.getElementById("edit-select-status"),
  editTaskDivBtnGrp: document.querySelector(".edit-task-div .button-group"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),

  //FILTER DIV
  filterDiv: document.getElementById("filterDiv"),
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS

function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  elements.boardsContainer.innerHTML = "";
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //fixed the syntax for assigning boards
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    elements.boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDiv.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    const filteredTasks = tasks.filter(
      (task) => task.board === boardName && task.status === status
    );

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", () => {
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  }); // corrected forEach syntax and used the classlist propertyto add and remove classes
}

function addTaskToUI(task) {
  const column = document.querySelectorAll(
    `.column-div[data-status="${task.status}"]`
  );

  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = elements.tasksContainerAll;

  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );

    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.innerHTML = `${task.title}`; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);

  console.log(initialData);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false, elements.modalWindow);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  //Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
    location.reload();
  });
}

// Toggles tasks modal
function toggleModal(show, modal = elements.modalWindow) {
  if (show) {
    modal.style.display = "block";
  } else {
    modal.style.display = "none";
  }
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task = {
    title: document.getElementById("title-input").value,
    description: document.getElementById("desc-input").value,
    status: document.getElementById("select-status").value,
    board: activeBoard,
  };
  const newTask = createNewTask(task);

  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    newTask.board = activeBoard;

    putTask(newTask);

    refreshTasksUI;
  }
}

function toggleSidebar(show) {
  if (show) {
    //console.log("show sidebar button clicked");
    elements.sidebar.style.display = "flex";
    elements.showSideBarBtn.style.display = "none";
  } else {
    elements.sidebar.style.display = "none";
    elements.showSideBarBtn.style.display = "block";
  }
}

function toggleTheme() {
  const body = document.body;

  //toggle between light-mode and dark-mode classes
  body.classList.toggle("light-theme");
  body.classList.toggle("dark-theme");

  //save theme preference to local storage
  const isLightTheme = body.classList.contains("light-theme");

  if (isLightTheme) {
    logo.src = "./assets/logo-light.svg";
  } else {
    logo.src = "./assets/logo-dark.svg";
  }
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  toggleModal(true, elements.editTaskModal);

  elements.saveTaskChangesBtn.addEventListener("click", () => {
    saveTaskChanges(task.id);
  });

  elements.deleteTaskBtn.addEventListener("click", () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    location.reload();
  });
}

function saveTaskChanges(taskId) {
  // Got new user inputs
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");

  // Created an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: titleInput.value,
    description: descInput.value,
    status: statusSelect.value,
  };
  // Updated task using a helper functoin
  patchTask(taskId, updatedTask);

  // Closed the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);

  refreshTasksUI();

  location.reload();
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
