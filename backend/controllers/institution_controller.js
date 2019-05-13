const { ipcRenderer } = require('electron');
const decryptRSAPublic = require('../utils/crypto_utils').decryptRSAPublic;
const decryptAES = require('../utils/crypto_utils').decryptAES;
const fs = require('fs');
const homedir = require('os').homedir();
const path = require("path");

exports.decryptPatientData = function(data){
    const pathPublicKey = path.join(homedir, "/prontuchain/keys", data.patientEmail, "/public.pem");
    let publicKey = fs.readFileSync(pathPublicKey, 'utf8');
    let key = decryptRSAPublic(data.keyCrypto, publicKey);
    let dataArray = decryptAES(data.dataCrypto, key);
    return eval(dataArray);
}