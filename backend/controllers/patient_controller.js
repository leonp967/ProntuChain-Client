const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const CryptedRecord = require('../models/crypted_record');
const RecordData = require('../models/record_data');
const decryptRSA = require('../utils/crypto_utils').decryptStringWithRsaPrivateKey
const decryptAES = require('../utils/crypto_utils').decryptAES
const path = require("path");
const homedir = require('os').homedir();
const UserController = require('./user_controller');
const { ipcRenderer } = require('electron');

exports.queryResult = async function(email, cpf, type, dateFrom, dateTo){
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
                contract.submitTransaction('retrieve', cpf, dateFrom, dateTo)
                .then((issueResponse) => {
                    let array = JSON.parse(issueResponse);
                    let results = [];
                    array = eval(array);
                    array.forEach((obj) => {
                        let record = obj.Record;
                        let keyCrypto = record.cryptedRecord.keyCrypto
                        let chave = decryptRSA(keyCrypto, pathPrivateKey);
                        let stringDados = decryptAES(record.cryptedRecord.dataCrypto, chave);
                        let dados = RecordData.deserialize(stringDados);
                        results.push(dados);
                    });
                    ipcRenderer.send('query-finish', results);
                })
            })
        }).catch((error) => {
            console.log(error);
        });
    } catch(error){
        console.log(`Error processing transaction. ${error}`);
    }
}