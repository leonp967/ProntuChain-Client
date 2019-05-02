var Request = require('request');
const { ipcRenderer } = require('electron');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const path = require("path");
const homedir = require('os').homedir();

function importToWallet(certificate, key, email){
  const wallet = new FileSystemWallet(path.join(homedir, 'prontuchain/wallet'));
  const identity = X509WalletMixin.createIdentity('Org1MSP', certificate, key);
  wallet.import(email, identity);
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
      const bodyJson = JSON.parse(body);
      importToWallet(bodyJson.certificate, bodyJson.key, email);
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
      const bodyJson = JSON.parse(body);
      ipcRenderer.send('login-finish', response.statusCode, bodyJson.email, bodyJson.name, bodyJson.cpf);
  });
}