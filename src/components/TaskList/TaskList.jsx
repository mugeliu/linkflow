// src/components/TaskList/TaskList.jsx
import React, { useState } from "react";
import styles from "./TaskList.module.css";

const TaskList = ({ tasks, onDelete, onToggle, onEdit }) => {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setNewTitle(task.title);
  };

  const handleEdit = (taskId) => {
    onEdit(taskId, newTitle);
    setEditingTaskId(null);
    setNewTitle("");
  };

  return (
    <div>
      <h2>Task List</h2>
      <ul className={styles.taskList}>
        {tasks.map((task) => (
          <li key={task.id} className={styles.taskItem}>
            {editingTaskId === task.id ? (
              <div>
                <input
                  type="text"
                  className={styles.editInput}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <button
                  onClick={() => handleEdit(task.id)}
                  className={styles.saveButton}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTaskId(null)}
                  className={`${styles.cancelButton} ${styles.button}`}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span
                  className={
                    task.completed
                      ? `${styles.taskTitle} ${styles.completed}`
                      : styles.taskTitle
                  }
                  onClick={() => onToggle(task.id)}
                >
                  {task.title}
                </span>
                <div className={styles.buttonContainer}>
                  <button
                    onClick={() => onDelete(task.id)}
                    className={styles.taskButton}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => startEditing(task)}
                    className={styles.taskButton}
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
