const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const RecordData = require('../models/record_data');
const decryptRSAPrivate = require('../utils/crypto_utils').decryptRSAPrivate;
const encryptRSAPrivate = require('../utils/crypto_utils').encryptRSAPrivate;
const decryptAES = require('../utils/crypto_utils').decryptAES;
const encryptAES = require('../utils/crypto_utils').encryptAES;
const generateKey = require('../utils/crypto_utils').generateAESKey;
const path = require("path");
const homedir = require('os').homedir();
const { ipcRenderer } = require('electron');

exports.queryResult = async function(email, cpf, type, dateFrom, dateTo, showResults){
    try{
        const pathPrivateKey = path.join(homedir, "/prontuchain/keys", email, "/private.pem");
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
                contract.submitTransaction('retrieve', type, cpf, dateFrom, dateTo)
                .then((issueResponse) => {
                    let array = JSON.parse(issueResponse);
                    let results = [];
                    array = eval(array);
                    array.forEach((obj) => {
                        let record = obj.Record;
                        let keyCrypto = record.cryptedRecord.keyCrypto
                        let chave = decryptRSAPrivate(keyCrypto, pathPrivateKey);
                        let stringDados = decryptAES(record.cryptedRecord.dataCrypto, chave);
                        let dados = RecordData.deserialize(stringDados);
                        results.push(dados);
                    });
                    ipcRenderer.send('query-finish', results, showResults);
                }).catch((error) => {
                    console.dir(error);
                    ipcRenderer.send('error', 'consulta', 500);
                })
            })
        }).catch((error) => {
            console.dir(error);
            ipcRenderer.send('error', 'consulta', 500);    
        });
    } catch(error){
        console.dir(error);
        ipcRenderer.send('error', 'consulta', 500);
    }
}

exports.encryptPatientData = function(results, email, name, senderEmail){
    try{
        const pathPrivateKey = path.join(homedir, "/prontuchain/keys", email, "/private.pem");
        let key = generateKey();
        let keyCrypto = encryptRSAPrivate(key, pathPrivateKey, 'senha');
        let dataString = JSON.stringify(results);
        let dataCrypto = encryptAES(dataString, key);
        let dataToSend = {
            keyCrypto: keyCrypto,
            dataCrypto: dataCrypto,
            patientName: name,
            patientEmail: email,
            receiverEmail: senderEmail
        }
        return dataToSend;
    } catch(error){
        console.dir(error);
        return ipcRenderer.send('error', 'encriptação', 500);
    }
}