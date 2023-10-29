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
const deleteEl = document.getElementById("delete-el")

buttonEl.addEventListener("click", function(){
    let inputValue = inputEl.value;
    push(todoListinDatabase, inputValue);
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
        allTasks += `
            <div class="task-item" id="task-item-${index}">
                <input type="checkbox" id="checkbox-${index}" style="width: 20px; height: 20px;" />
                <label for="checkbox-${index}">
                    <span id="task-${index}">${task}</span>
                </label>
            </div>
            `;
        });
        listsEl.innerHTML = allTasks;
    }
    
    tasks.forEach((_, index) => {
        const checkbox = document.getElementById(`checkbox-${index}`);
        const taskItem = document.getElementById(`task-item-${index}`);
        const taskItemRef = ref(database, `completed/${index}`);

        checkbox.addEventListener('change', function() {
            const isChecked = checkbox.checked;
            if (isChecked) {
                taskItem.style.backgroundColor = 'lightgreen'; // Change background color of the entire task item
                set(taskItemRef, true); // Update completion status in the database
            } else {
                taskItem.style.backgroundColor = ''; // Reset background color
                set(taskItemRef, false); // Update completion status in the database
            }
        });

        onValue(taskItemRef, snapshot => {
            const isCompleted = snapshot.val();
            if (isCompleted) {
                taskItem.style.backgroundColor = 'lightgreen';
                checkbox.checked = true;
            } else {
                taskItem.style.backgroundColor = ''; // Set background to default if not completed
                checkbox.checked = false;
            }
        });
    });
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
    }else{
        message.content = "no tasks"
    }
});

onValue(todoListinDatabase, (snapshot) => {
    const data = snapshot.val();
    const tasks = Object.values(data || []);
    render(tasks);
})
