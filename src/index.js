const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find(user => user.username === username)
  
  if(!user){
    return response.status(404).json({error: "User not found"})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const{name, username} = request.body
  
  const usernameAlreadyExists = users.some(user => user.username === username)

  if(usernameAlreadyExists){
    return response.status(400).json({error: 'Username already exists!'})
  }

  users.push({id: uuidv4(), name, username, todos: []})

  return response.status(201).send(users[0])
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).send(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body
  const id = request.params.id

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).send({error: "Todo not found"})
  }

  const updatedTodo = {
    title,
    deadline,
    done: false
  }
  
  todo.title = updatedTodo.title
  todo.deadline = updatedTodo.deadline

  return response.send(updatedTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const id = request.params.id

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).send({error: "Todo not found"})
  }

  const todoDone = {
    id: todo.id,
    title: todo.title,
    deadline: todo.deadline,
    created_at: todo.created_at,
    done: true
  }

  todo.id = todoDone.id
  todo.title = todoDone.title
  todo.deadline = todoDone.deadline
  todo.created_at = todoDone.created_at
  todo.done = todoDone.done

  return response.send(todoDone)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1){
    return response.status(404).send({error: "Todo not found"})
  }  

  user.todos.splice(todoIndex, 1)

  user.todos = []

  return response.status(204).json()

});

module.exports = app;