import React, { useState } from "react";
import "./App.css";
import TaskList from "./components/TaskList";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState(""); //newTask的初始默认值是"",每次调用setNewTask的时候都会更新newTask的值

  const handleAddTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, { id: tasks.length, text: newTask, completed: false }]);
    setNewTask(""); //每次添加完任务后，将newTask的值置为空
  };

  const handleDeleteTask = (taskId) => {
    //setTasks(tasks.filter(task => task.id !== taskId));
    setTasks(
      tasks.filter((task) => {
        return task.id !== taskId;
      })
    );
  };

  const onToggle = (taskId) => {};

  return (
    <div>
      <TaskList
        tasks={tasks}
        handleDeleteTask={handleDeleteTask}
        onToggle={onToggle}
      />
    </div>
  );
}

export default App;
