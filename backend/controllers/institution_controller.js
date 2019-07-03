const { ipcRenderer } = require('electron');
const decryptRSAPublic = require('../utils/crypto_utils').decryptRSAPublic;
const decryptAES = require('../utils/crypto_utils').decryptAES;
const fs = require('fs');
const homedir = require('os').homedir();
const path = require("path");
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');

exports.decryptPatientData = function(data){
    try {
        const pathPublicKey = path.join(homedir, "/prontuchain/keys", data.patientEmail, "/public.pem");
        let publicKey = fs.readFileSync(pathPublicKey, 'utf8');
        let key = decryptRSAPublic(data.keyCrypto, publicKey);
        let dataArray = decryptAES(data.dataCrypto, key);
        return eval(dataArray);
    } catch (error) {
        console.dir(error);
        return ipcRenderer.send('error', 'decriptação', 500);
    }
}

exports.includeData = async function(email, patientEmail, cpf, type, date, description){
    try {
        const pathPublicKey = path.join(homedir, "/prontuchain/keys", patientEmail, "/public.pem");
        let publicKey = fs.readFileSync(pathPublicKey, 'utf8');
        const wallet = new FileSystemWallet(path.join(homedir, 'prontuchain/wallet'));
        const gateway = new Gateway();

        let connectionProfile = yaml.load(fs.readFileSync(path.join(__dirname, '../prontuchain-connection/config.yaml'), 'utf8'));

        let connectionOptions = {
            identity: email,
            wallet: wallet,
            discovery: { enabled:false, asLocalhost: true }
        };

        gateway.connect(connectionProfile, connectionOptions)
        .then(() => {
            gateway.getNetwork('prontuchain')
            .then((network) => {
                const contract = network.getContract('recordcontract', 'org.prontuchain.MedicalRecord');
                contract.submitTransaction('create', cpf, date, type, description, publicKey)
                .then(() => {
                    ipcRenderer.send('create-finish');
                })
            })
        });
    } catch(error){
        console.dir(error);
        return ipcRenderer.send('error', 'inclusão', 500);
    }
}