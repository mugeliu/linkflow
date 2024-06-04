import React, { useState, useEffect } from "react";
import "./App.css";
import TaskList from "./components/TaskList";
import TaskInput from "./components/TaskInput";

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
      { id: tasks.length + 1, text: newTask, completed: false },
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

  return (
    <div>
      <TaskList
        tasks={tasks}
        onDelete={handleDeleteTask}
        onToggle={toggleTask}
      />
      <TaskInput addTask={handleAddTask} />
    </div>
  );
}

export default App;
