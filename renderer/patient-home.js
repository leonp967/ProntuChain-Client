'use strict'

const { ipcRenderer } = require('electron');
const remote = require('electron').remote;
const PatientController = require('../backend/controllers/patient_controller');

document.getElementById('query-btn').addEventListener('click', () => {
    var type = document.getElementById('picker-type').value;
    var dateFrom = document.getElementById('date-from').value;
    var dateTo = document.getElementById('date-to').value;
    var email = remote.getGlobal('userEmail');
    var cpf = remote.getGlobal('userCpf');
    PatientController.queryResult(email, cpf, type, dateFrom, dateTo);
});

ipcRenderer.on('query', (event, response) => {
    console.log(response);
})
