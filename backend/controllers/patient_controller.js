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

exports.queryResult = async function(type, dateFrom, dateTo){
    try{
        const wallet = new FileSystemWallet(path.join(homedir, 'prontuchain/wallet'));
        const gateway = new Gateway();
        var email = UserController.getEmail();
        var cpf = UserController.getCpf();

        let connectionProfile = yaml.load(fs.readFileSync(path.join(__dirname, '../prontuchain-connection/config.yaml'), 'utf8'));

        let connectionOptions = {
            identity: email,
            wallet: wallet,
            discovery: { enabled:false, asLocalhost: true }
        };

        await gateway.connect(connectionProfile, connectionOptions);
        const network = await gateway.getNetwork('prontuchain');
        const contract = await network.getContract('recordcontract', 'org.prontuchain.MedicalRecord');
        issueResponse = await contract.submitTransaction('retrieve', cpf, dateFrom, dateTo);
        var response = issueResponse.toString();
        // let record = CryptedRecord.fromBuffer(issueResponse);
        // let chaveCriptografada = record.getChave();
        // let chave = decryptRSA(chaveCriptografada, path.join(homedir, 'prontuchain-keys/private.pem'), 'senha');
        // let stringDados = decryptAES(record.getDados(), chave);
        // let dados = RecordData.deserialize(stringDados);
        return response;
    } catch(error){
        console.log(`Error processing transaction. ${error}`);
    }
}