import React, { useState } from "react";

const TaskList = () => {
  const test = [
    {
      id: 1,
      title: "Task 1",
    },
    {
      id: 2,
      title: "Task 2",
    },
    {
      id: 3,
      title: "Task 3",
    },
  ];

  const [tasks, setTasks] = useState([...test]);
  const [newTask, setNewTask] = useState("");

  const handleAddTask = () => {
    //setTasks("");
  };

  return (
    <div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
      <input
        type="text"
        value={newTask}
        onChange={(e) => {
          console.log(e);
          setNewTask(e.target.value);
        }}
        placeholder="Enter new task"
      />
      <button onClick={handleAddTask}>Add Task</button>
    </div>
  );
};

export default TaskList;
