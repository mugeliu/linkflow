import React, { useState, useEffect } from "react";
import TaskList from "./components/TaskList/TaskList";
import TaskInput from "./components/TaskInput/TaskInput";

import styles from "./App.module.css";
import "./index.css";

function App() {
  // 用useState来创建一个状态变量tasks，并存在localStorage中
  const [tasks, setTasks] = useState(() => {
    const setTasks = localStorage.getItem("tasks");
    return setTasks ? JSON.parse(setTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // 添加任务
  const handleAddTask = (newTask) => {
    setTasks([
      ...tasks,
      { id: tasks.length + 1, title: newTask, completed: false },
    ]);
  };

  // 删除任务
  const handleDeleteTask = (taskId) => {
    //setTasks(tasks.filter(task => task.id !== taskId));
    setTasks(
      tasks.map((task) => {
        if (task.id == taskId) {
          return { ...task, completed: true };
        }
        return task;
      })
    );
  };

  // 点击取消完成任务
  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const editTask = (id, newTitle) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, title: newTitle } : task
      )
    );
  };

  return (
    <div className={styles.container}>
      <TaskList
        tasks={tasks}
        onDelete={handleDeleteTask}
        onToggle={toggleTask}
        onEdit={editTask}
      />
      <TaskInput addTask={handleAddTask} />
    </div>
  );
}

export default App;
