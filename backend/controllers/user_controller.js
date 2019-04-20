var Request = require('request');
const { ipcRenderer } = require('electron');

var userEmail;
var userName;
var userCpf;

exports.getEmail = function(){
  return userEmail;
}

exports.getName = function(){
  return userName;
}

exports.getCpf = function(){
  return userCpf;
}

exports.createUser = (email, password, cpf, nome) => {
  Request.post({
    "headers": { "content-type": "application/json" },
    "url": "http://localhost:3000/signup",
    "body": JSON.stringify({
        "email": email,
        "password": password,
        "name": nome,
        "cpf": cpf
    })
  }, (error, response, body) => {
      if(error) {
          return console.dir(error);
      }
      ipcRenderer.send('signup-finish', response.statusCode);
  });
}

exports.userLogin = (email, password) => {
  Request.post({
    "headers": { "content-type": "application/json" },
    "url": "http://localhost:3000/login",
    "body": JSON.stringify({
        "email": email,
        "password": password
    })
  }, (error, response, body) => {
      if(error) {
          return console.dir(error);
      }
      if(response.statusCode == 201){
        userEmail = body.email;
        userName = body.name;
        userCpf = body.cpf;
      }
      ipcRenderer.send('login-finish', response.statusCode);
  });
}