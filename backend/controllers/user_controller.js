var Request = require('request');
const { ipcRenderer } = require('electron');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const path = require("path");
const homedir = require('os').homedir();
const NodeRSA = require('node-rsa');
const fs = require('fs');
const authServerUrl = 'https://prontuchain-auth-server.herokuapp.com'

function importToWallet(certificate, key, email){
  const wallet = new FileSystemWallet(path.join(homedir, 'prontuchain/wallet'));
  const identity = X509WalletMixin.createIdentity('Org1MSP', certificate, key);
  return wallet.import(email, identity);
}

function generateKeys(email, password){
  const key = new NodeRSA();
  key.generateKeyPair();
  let publicKey = key.exportKey('pkcs8-public');
  let privateKey = key.exportKey('pkcs8-private');
  let dir = path.join(homedir, 'prontuchain/keys', email);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFile(path.join(dir, "/public.pem"), publicKey, function(err) {
      if(err) {
          return console.log(err);
      }
      fs.writeFile(path.join(dir, "/private.pem"), privateKey, function(err) {
        if(err) {
          return console.log(err);
        }
        ipcRenderer.send('signup-finish', response.statusCode);
    });
  });
}

exports.createUser = (email, password, cpf, nome) => {
  Request.post({
    "headers": { "content-type": "application/json" },
    "url": authServerUrl + "/signup",
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
      importToWallet(bodyJson.certificate, bodyJson.key, email)
      .then(() => {
        generateKeys(email, password);
      })
  });
}

exports.userLogin = (email, password) => {
  Request.post({
    "headers": { "content-type": "application/json" },
    "url": authServerUrl + "/login",
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