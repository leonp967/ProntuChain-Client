'use strict'

const { ipcRenderer } = require('electron');
const UserController = require('../backend/controllers/user_controller');
const dialog = require('electron').remote.dialog;

// delete todo by its text value ( used below in event listener)
const deleteTodo = (e) => {
  ipcRenderer.send('delete-todo', e.target.textContent)
};

document.getElementById('login-button').addEventListener('click', async(evt) => {
    evt.preventDefault();  
    const form = document.getElementById('loginForm');
    const email = form[0].value;
    const senha = form[1].value;
    UserController.userLogin(email, senha);
});

document.getElementById('signup-button').addEventListener('click', () => {
  ipcRenderer.send('signup');
});
