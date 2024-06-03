import React from "react";

const TaskList = ({ tasks, handleDeleteTask, onToggle }) => {
  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((tasks) => (
          <li key={tasks.id}>
            <span
              style={{
                textDecoration: task.completed ? "line-through" : "none",
              }}
              onClick={() => onToggle(task.id)}
            >
              {task.text}
            </span>
            <button onClick={() => handleDeleteTask(tasks.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
