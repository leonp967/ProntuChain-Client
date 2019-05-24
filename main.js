'use strict'

const path = require('path')
const { app, ipcMain, dialog } = require('electron')

const Window = require('./Window')
const Pusher = require('pusher-js')
const PUSHER_APP_ID = 778664
const PUSHER_APP_KEY = '788ef446a7568b9f660d'
const PUSHER_APP_SECRET = '9ba578381ef2ab0460cd'
const PUSHER_APP_CLUSTER= 'us2'

function main () {
  global.userEmail = null;
  global.userCpf = null;
  global.userName = null;
  global.senderEmail = null;
  let socketId = null;

  let mainWindow = new Window({
    file: path.join(app.getAppPath(), 'renderer', 'index.html')
  })

  var pusher = new Pusher(PUSHER_APP_KEY, { cluster: PUSHER_APP_CLUSTER });
  pusher.connection.bind('connected', function () {
      socketId = pusher.connection.socket_id;
  });

  var channel = pusher.subscribe('notifications');
  channel.bind('view-permission', function (request) {
      if(request.cpf == global.userCpf){
        global.senderEmail = request.senderEmail;
        mainWindow.send('view-request', request);
      }
  });

  channel.bind('patient-data', function (data) {
    if(global.userCpf.length > 11 && data.receiverEmail == global.userEmail)
      mainWindow.send('show-data', data);
  });

  let signupWin;

  ipcMain.on('signup', () => {
    signupWin = new Window({
        file: path.join(app.getAppPath(), 'renderer', 'signup.html'),
        width: 400,
        height: 400,
        parent: mainWindow
      })

      signupWin.on('closed', () => {
        signupWin = null
      })
  })

  ipcMain.on('signup-ok', () => {
    if(signupWin){
      signupWin.close();
      signupWin = null;
    }
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
        mainWindow.loadFile(path.join(app.getAppPath(), '/renderer/patient-home.html'));
      else
        mainWindow.loadFile(path.join(app.getAppPath(), '/renderer/institution-home.html'));
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
        appId: PUSHER_APP_ID,
        key: PUSHER_APP_KEY,
        secret: PUSHER_APP_SECRET,
        cluster: PUSHER_APP_CLUSTER
    });

    pusherServer.trigger('notifications', 'view-permission', request, socketId);
  })

  ipcMain.on('send-data', (event, data) => {
    let Pusher = require('pusher');
    let pusherServer = new Pusher({
        appId: PUSHER_APP_ID,
        key: PUSHER_APP_KEY,
        secret: PUSHER_APP_SECRET,
        cluster: PUSHER_APP_CLUSTER
    });

    pusherServer.trigger('notifications', 'patient-data', data, socketId);
  })

  let createWin;

  ipcMain.on('create', () => {
    createWin = new Window({
      file: path.join(app.getAppPath(), 'renderer', 'include-data.html'),
      width: 500,
      height: 500,
      parent: mainWindow
    })

    createWin.on('closed', () => {
      createWin = null
    })
  })

  ipcMain.on('create-finish', () => {
    if(createWin){
      createWin.close();
      createWin = null;
      const options = {
        type: 'info',
        buttons: ['OK'],
        title: 'Aviso',
        message: 'Inclusão realizada com sucesso!'
      };
      dialog.showMessageBox(null, options);
    }
  })
}

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
