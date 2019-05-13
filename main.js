'use strict'

const path = require('path')
const { app, ipcMain, dialog } = require('electron')

const Window = require('./Window')
const DataStore = require('./DataStore')
require('dotenv').config()
const Pusher = require('pusher-js')

require('electron-reload')(__dirname)

// create a new todo store name "Todos Main"
const todosData = new DataStore({ name: 'Todos Main' })

function main () {
  global.userEmail = null;
  global.userCpf = null;
  global.userName = null;
  global.senderEmail = null;
  let socketId = null;

  let mainWindow = new Window({
    file: path.join('renderer', 'index.html')
  })

  var pusher = new Pusher(process.env.PUSHER_APP_KEY, { cluster: process.env.PUSHER_APP_CLUSTER });
  pusher.connection.bind('connected', function () {
      socketId = pusher.connection.socket_id;
  });

  var channel = pusher.subscribe('notifications');
  channel.bind('view-permission', function (request) {
      // var notification = new Notification(post.title + " was just updated. Check it out.");
      // notification.onclick = function (event) {
      //     window.location.href = '/posts/' + post._id;
      //     event.preventDefault();
      //     notification.close();
      // }
      if(request.cpf == global.userCpf){
        global.senderEmail = request.senderEmail;
        mainWindow.send('view-request', request);
      }
  });

  channel.bind('patient-data', function (data) {
    if(global.userCpf.length > 11 && data.receiverEmail == global.userEmail)
      mainWindow.send('show-data', data);
  });

  // add todo window
  let signupWin

  // TODO: put these events into their own file

  // initialize with todos
  mainWindow.once('show', () => {
    mainWindow.webContents.send('todos', todosData.todos)
  })

  // create add todo window
  ipcMain.on('signup', () => {
    // if addTodoWin does not already exist
    if (!signupWin) {
      // create a new add todo window
      signupWin = new Window({
        file: path.join('renderer', 'signup.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: mainWindow
      })

      // cleanup
      signupWin.on('closed', () => {
        signupWin = null
      })
    }
  })

  ipcMain.on('signup-ok', () => {
    signupWin.close();
    signupWin = null;
  })

  ipcMain.on('signup-finish', (event, response) => {
    event.sender.send('signup-check', response);
  })

  ipcMain.on('login-finish', (event, code, email, name, cpf) => {
    if(code == 200){
      global.userEmail = email;
      global.userName = name;
      global.userCpf = cpf;
      if(cpf.length == 11)
        mainWindow.loadFile(path.join(__dirname, '/renderer/patient-home.html'));
      else
        mainWindow.loadFile(path.join(__dirname, '/renderer/institution-home.html'));
    }
    else{
      const options = {
        type: 'error',
        buttons: ['OK'],
        title: 'Erro',
        message: 'Email ou senha inválidos!'
      };
      dialog.showMessageBox(null, options);
    }
  })

  ipcMain.on('query-finish', (event, results, showResults) => {
    if(showResults)
      mainWindow.send('query', results);
    else
      mainWindow.send('query-permission', results);
  })

  ipcMain.on('view-permission', (event, request) => {
    let Pusher = require('pusher');
    let pusherServer = new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_APP_KEY,
        secret: process.env.PUSHER_APP_SECRET,
        cluster: process.env.PUSHER_APP_CLUSTER
    });

    pusherServer.trigger('notifications', 'view-permission', request, socketId);
  })

  ipcMain.on('send-data', (event, data) => {
    let Pusher = require('pusher');
    let pusherServer = new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_APP_KEY,
        secret: process.env.PUSHER_APP_SECRET,
        cluster: process.env.PUSHER_APP_CLUSTER
    });

    pusherServer.trigger('notifications', 'patient-data', data, socketId);
  })

  // add-todo from add todo window
  ipcMain.on('add-todo', (event, todo) => {
    const updatedTodos = todosData.addTodo(todo).todos

    mainWindow.send('todos', updatedTodos)
  })

  // delete-todo from todo list window
  ipcMain.on('delete-todo', (event, todo) => {
    const updatedTodos = todosData.deleteTodo(todo).todos

    mainWindow.send('todos', updatedTodos)
  })
}

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
