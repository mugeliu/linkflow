import React, { useState } from "react";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState(""); //newTask的初始默认值是"",每次调用setNewTask的时候都会更新newTask的值

  const handleAddTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, { id: tasks.length, text: newTask }]);
    setNewTask(""); //每次添加完任务后，将newTask的值置为空
  };

  const handleDeleteTask = (id) => {
    confirm("test", id);
    setTasks(
      tasks.filter((tasks) => {
        tasks.id !== id;
      })
    );
  };

  return (
    <div>
      <ul>
        {tasks.map((tasks) => (
          <li key={tasks.id}>
            {tasks.text}
            <button onClick={() => handleDeleteTask(tasks.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newTask}
        onChange={(e) => {
          setNewTask(e.target.value);
        }}
        placeholder="Enter new task"
      />
      <button onClick={handleAddTask}>Add Task</button>
    </div>
  );
};

export default TaskList;
