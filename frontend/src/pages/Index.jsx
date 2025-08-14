import { useState, useEffect, useRef } from 'react'
import './Index.css'
import api from '../services/api'

function Index() {
  const status = {
    done: 'Concluído',
    working: 'Em andamento',
    pending: 'Pendente'
  }
  
  const [tasks, setTasks] = useState([])

  const getTasks = async () => {
    try {
      const response = await api.get('/get-tasks')
      setTasks(response.data)
      console.log(response)
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    }
  }

  const inputDescription = useRef()
  const inputResponsable = useRef()
  const inputStatus = useRef()

  const insertTask = async (e) => {
    e.preventDefault()
    try {
      await api.post('/insert-task', {
        description: inputDescription.current.value,
        responsable: inputResponsable.current.value,
        status: inputStatus.current.value,
      })
      getTasks()
    } catch (error) {
      console.error('Erro ao inserir tarefa:', error)
    }
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
                <p>Status: {status[task.status]}</p>
                <p>Computador: {task.computerName}</p>
              </li>
            )
          })}
        </ol>
      </div>
      <button onClick={() => getTasks()}>
        Buscar tarefas
      </button>
      <form id='task-form' onSubmit={insertTask}>
        <h1>Adicione sua tarefa!</h1>
        <input type="text" placeholder='Descrição' ref={inputDescription} />
        <input type="text" placeholder='Responsável' ref={inputResponsable} />
        <select ref={inputStatus} defaultValue="">
          <option value="">Status</option>
          <option value="pending">Pendente</option>
          <option value="working">Em andamento</option>
          <option value="done">Concluído</option>
        </select>
        <button type='submit'>
          Adicionar tarefa
        </button>
      </form>
    </>
  )
}

export default Index
