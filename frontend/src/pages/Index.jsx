import { useState, useEffect, useRef } from 'react'
import './Index.css'
import api from '../services/api'

function Index() {
  const [tasks, setTasks] = useState([])

  const getTasks = async () => {
    const response = await api.get('/get-tasks')
    setTasks(response.data)
    console.log(response)
  }

  const inputDescription = useRef()
  const inputResponsable = useRef()
  const inputStatus = useRef()

  const insertTask = async () => {

    await api.post('/insert-task', {
      description: inputDescription.current.value,
      responsable: inputResponsable.current.value,
      status: inputStatus.current.value,
    })
  }

  useEffect(() => {
    getTasks()
  }, [])

  return (
    <>
      <h1>Adicione e veja suas tarefas!</h1>
      <div className="card">
        <ol>
          {tasks.map((task) => {
            return (
              <li key={task.id}>
                <p>Descrição: {task.description}</p>
                <p>Responsável: {task.responsable}</p>
                <p>Status: {task.status}</p>
                <p>Computador: {task.computerName}</p>
              </li>
            )
          })}
        </ol>
      </div>
      <button onClick={() => getTasks()}>
        Buscar tarefas
      </button>
      <form id='task-form'>
        <h1>Adicione sua tarefa!</h1>
        <input type="text" placeholder='Descrição' ref={inputDescription} />
        <input type="text" placeholder='Responsável' ref={inputResponsable} />
        <input type="text" placeholder='Status' ref={inputStatus} />
        <button type='submit' onClick={() => insertTask()}>
          Adicionar tarefa
        </button>
      </form>
    </>
  )
}

export default Index
