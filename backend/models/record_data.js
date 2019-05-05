'use strict';

class RecordData {

    constructor(obj) {
        Object.assign(this, obj);
    }

    getCpf() {
        return this.cpf;
    }

    getData() {
        return this.data;
    }

    getDescricao() {
        return this.texto;
    }

    getTipo(){
        return this.tipo;
    }

    static getClass() {
        return 'org.prontuchain.RecordData';
    }

    static deserialize(data) {
        let json = JSON.parse(data.toString());
        let object = new (RecordData)(json);
        return object;
    }
}

module.exports = RecordData;