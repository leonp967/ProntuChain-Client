'use strict'

const { ipcRenderer } = require('electron')
const UserController = require('../backend/controllers/user_controller')

// delete todo by its text value ( used below in event listener)
const deleteTodo = (e) => {
  ipcRenderer.send('delete-todo', e.target.textContent)
}

// create add todo window button
document.getElementById('login-button').addEventListener('click', () => {
  const form = document.getElementById('loginForm');
    // input on the form
    const email = form[0].value;
    const senha = form[1].value;
    UserController.userLogin(email, senha);
})

document.getElementById('signup-button').addEventListener('click', () => {
  ipcRenderer.send('signup');
})

// on receive todos
ipcRenderer.on('todos', (event, todos) => {
  // get the todoList ul
  const todoList = document.getElementById('todoList')
  // create html string
  const todoItems = todos.reduce((html, todo) => {
    html += `<li class="todo-item">${todo}</li>`

    return html
  }, '')

  // set list html to the todo items
  todoList.innerHTML = todoItems

  // add click handlers to delete the clicked todo
  todoList.querySelectorAll('.todo-item').forEach(item => {
    item.addEventListener('click', deleteTodo)
  })
})
