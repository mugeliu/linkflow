import React from "react";

const TaskList = ({ tasks, onDelete, onToggle, onEdit }) => {
  const [editTaskId, setEditTaskId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map((tasks) => (
          <li key={tasks.id}>
            {editTaskId === tasks.id ? (
              <div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <button onClick={() => handleEdit(task.id)}>Save</button>
                <button onClick={() => setEditingTaskId(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <span
                  style={{
                    textDecoration: tasks.completed ? "line-through" : "none",
                  }}
                  onClick={() => onToggle(tasks.id)}
                >
                  {tasks.text}
                </span>
                <button onClick={() => onDelete(tasks.id)}>Delete</button>
                <button onClick={() => startEditing(task)}>Edit</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
