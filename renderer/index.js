'use strict'

const { ipcRenderer } = require('electron');
const path = require('path');
const remote = require('electron').remote;
const app = remote.app;
const UserController = require(path.join(app.getAppPath(), '/backend/controllers/user_controller'));
const dialog = remote.dialog;

document.getElementById('login-button').addEventListener('click', async(evt) => {
    evt.preventDefault();
    document.getElementById('loading').style.display = "block";
    const form = document.getElementById('loginForm');
    const email = form[0].value;
    const senha = form[1].value;
    try {
      UserController.userLogin(email, senha);
    } catch (error) {
      const options = {
        type: 'info',
        buttons: ['OK'],
        title: 'Erro',
        message: error
      };
      dialog.showMessageBox(options, null);
    }
    
});

document.getElementById('signup-button').addEventListener('click', () => {
  ipcRenderer.send('signup');
});

ipcRenderer.on('stop-loading', () => {
  document.getElementById('loading').style.display = "none";
})