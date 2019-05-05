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

exports.queryResult = async function(email, cpf, type, dateFrom, dateTo, password){
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
                    array = eval(array);
                    array.forEach((obj) => {
                        let record = obj.Record;
                        let keyCrypto = record.cryptedRecord.keyCrypto
                        let chave = decryptRSA(keyCrypto, pathPrivateKey, password);
                        let stringDados = decryptAES(record.dataCrypto, chave);
                        let dados = RecordData.deserialize(stringDados);
                        ipcRenderer.send('query-finish', dados);
                    });
                })
            })
        }).catch((error) => {
            console.log(error);
        });
        
        // let record = CryptedRecord.fromBuffer(issueResponse);
        // let chaveCriptografada = record.getChave();
        // let chave = decryptRSA(chaveCriptografada, path.join(homedir, 'prontuchain-keys/private.pem'), 'senha');
        // let stringDados = decryptAES(record.getDados(), chave);
        // let dados = RecordData.deserialize(stringDados);
    } catch(error){
        console.log(`Error processing transaction. ${error}`);
    }
}