import { useState } from 'react'
import './App.css'
import TaskList from './components/TaskList'


function App() {
  const [count, setCount] = useState(0);

  return (
      <div>
        <h1>Task List</h1>
        <TaskList />
      </div>
  );
}

export default App
