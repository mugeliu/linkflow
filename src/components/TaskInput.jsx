import React from "react";

const TaskInput = ({ newTask, setNewTask, handleAddTask }) => {
  return (
    <div>
      <input
        type="text"
        value={newTask}
        onChange={(e) => {
          setNewTask(e.target.value);
        }}
        placeholder="Enter new task"
      />
      <button
        onClick={() => {
          handleAddTask();
        }}
      >
        Add Task
      </button>
    </div>
  );
};

export default TaskInput;
