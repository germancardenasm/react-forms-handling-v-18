import { useState, useEffect } from 'react'
import { PlusCircle, AlertCircle } from 'lucide-react'
import { TodoForm } from './todo-form'
import { TodoList } from './todo-list'
import { TodoFilter } from './todo-filter'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getTodos, addTodo, updateTodo, deleteTodo } from '../lib/db'

export type Todo = {
  id: number
  text: string
  completed: boolean
}

export function TodoDashboard() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const fetchedTodos = await getTodos()
        setTodos(fetchedTodos)
      } catch (err) {
        setError('Failed to fetch todos. Please try again later.')
        console.error('Error fetching todos:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTodos()
  }, [])

  const handleAddTodo = async (text: string) => {
    try {
      setIsAdding(true)
      setError(null)
      const newTodo = await addTodo(text)
      setTodos([...todos, newTodo])
    } catch (err) {
      setError('Failed to add todo. Please try again.')
      console.error('Error adding todo:', err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleTodo = async (id: number) => {
    try {
      setUpdatingTodoId(id)
      setError(null)
      const todoToUpdate = todos.find(todo => todo.id === id)
      if (todoToUpdate) {
        const updatedTodo = await updateTodo(id, { completed: !todoToUpdate.completed })
        setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo))
      }
    } catch (err) {
      setError('Failed to update todo. Please try again.')
      console.error('Error updating todo:', err)
    } finally {
      setUpdatingTodoId(null)
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      setUpdatingTodoId(id)
      setError(null)
      await deleteTodo(id)
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (err) {
      setError('Failed to delete todo. Please try again.')
      console.error('Error deleting todo:', err)
    } finally {
      setUpdatingTodoId(null)
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  if (isLoading) {
    return <div className="text-center mt-8">Loading todos...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <TodoForm addTodo={handleAddTodo} isAdding={isAdding} />
      <TodoFilter filter={filter} setFilter={setFilter} />
      <TodoList 
        todos={filteredTodos} 
        toggleTodo={handleToggleTodo} 
        deleteTodo={handleDeleteTodo}
        updatingTodoId={updatingTodoId}
      />
      {todos.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          {todos.filter(todo => !todo.completed).length} items left
        </div>
      )}
    </div>
  )
}

