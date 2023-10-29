import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
    databaseURL: "https://todo-app-eb11c-default-rtdb.firebaseio.com/"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const todoListinDatabase = ref(database, "todoLists");

const inputEl = document.getElementById("input-el");
const buttonEl = document.getElementById("button-el");
const listsEl = document.getElementById("lists-el");
const deleteEl = document.getElementById("delete-el");

buttonEl.addEventListener("click", function(){
    let inputValue = inputEl.value;
    push(todoListinDatabase, { task: inputValue, completed: false }); // Store tasks with completion status
    clearInputField();
});

function clearInputField(){
    inputEl.value = "";
}

function render(tasks) {
    if (tasks.length === 0) {
        listsEl.innerHTML = "<p>No tasks yet! Add a task above.</p>";
    } else {
        let allTasks = "";
        tasks.forEach((task, index) => {
            const isCompleted = task.completed || false; // Check completion status
            const completedClass = isCompleted ? 'completed' : ''; // Add a class for completed tasks

            allTasks += `
                <div class="task-item ${completedClass}" id="task-item-${index}">
                    <input type="checkbox" id="checkbox-${index}" style="width: 20px; height: 20px;" ${isCompleted ? 'checked' : ''} />
                    <label for="checkbox-${index}">
                        <span id="task-${index}">${task.task}</span>
                    </label>
                </div>
            `;
        });
        listsEl.innerHTML = allTasks;

        tasks.forEach((task, index) => {
            const checkbox = document.getElementById(`checkbox-${index}`);
            const taskItem = document.getElementById(`task-item-${index}`);
            const taskItemRef = ref(database, `todoLists/${index}/completed`);

            checkbox.addEventListener('change', function() {
                const isChecked = checkbox.checked;
                set(taskItemRef, isChecked); // Update completion status in the database
            });

            onValue(taskItemRef, snapshot => {
                const isCompleted = snapshot.val();
                if (isCompleted) {
                    taskItem.classList.add('completed');
                    checkbox.checked = true;
                } else {
                    taskItem.classList.remove('completed');
                    checkbox.checked = false;
                }
            });
        });
    }
}

deleteEl.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all tasks?")) {
        // Remove all tasks from Firebase
        set(todoListinDatabase, null).then(() => {
            // Render an empty array as there are no tasks
            render([]);
        }).catch(error => {
            console.error("Error deleting tasks:", error);
            // You might want to handle errors, show a message, etc.
        });
    } else {
        console.log("Cancelled deletion of tasks.");
    }
});

onValue(todoListinDatabase, (snapshot) => {
    const data = snapshot.val();
    const tasks = Object.values(data || []);
    render(tasks);
});
