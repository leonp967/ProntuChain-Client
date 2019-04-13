class CryptedRecord {

    constructor(obj) {
        this.chave = obj.chave;
        this.dados = obj.dados;
    }

    getChave() {
        return this.chave;
    }

    getDados() {
        return this.dados;
    }

    static fromBuffer(buffer) {
        return CryptedRecord.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        let json = JSON.parse(data.toString());
        let object = new (CryptedRecord)(json);
        return object;
    }

    /**
     * Factory method to create a commercial paper object
     */
    static createInstance(chave, cpf, data, dados) {
        return new CryptedRecord({ chave, cpf, data, dados });
    }

    static getClass() {
        return 'org.prontuchain.CryptedRecord';
    }
}

module.exports = CryptedRecord;
