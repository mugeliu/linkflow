import React, { useState } from "react";
import styles from "./TaskInput.module.css";

const TaskInput = ({ addTask }) => {
  const [newTask, setNewTask] = useState(""); //newTask的初始默认值是"",每次调用setNewTask的时候都会更新newTask的值

  const handleSubmit = (e) => {
    e.preventDefault(); //阻止表单的默认刷新行为
    if (newTask.trim()) {
      addTask(newTask);
      setNewTask(""); //每次添加完任务后，将newTask的值置为空
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.input}
        value={newTask}
        onChange={(e) => {
          setNewTask(e.target.value);
        }}
        placeholder="Enter new task"
      />
      <button type="submit" className={styles.button}>
        Add Task
      </button>
    </form>
  );
};

export default TaskInput;
