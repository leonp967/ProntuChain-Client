'use strict'

const { ipcRenderer } = require('electron');
const remote = require('electron').remote;
const PatientController = require('../backend/controllers/patient_controller');
const dateFormat = require('dateformat');
const TypeEnum = require('../backend/models/types_enum').TypeEnum;

document.getElementById('query-btn').addEventListener('click', () => {
    document.getElementById('loading').style.display = "block";
    var type = document.getElementById('picker-type').value;
    var dateFrom = document.getElementById('date-from').value;
    var dateTo = document.getElementById('date-to').value;
    var email = remote.getGlobal('userEmail');
    var cpf = remote.getGlobal('userDocument');
    PatientController.queryResult(email, cpf, type, dateFrom, dateTo, true);
});

ipcRenderer.on('query', (event, results) => {
    const resultsDiv = document.getElementById('results-div');
    const resultsHtml = results.reduce((html, result) => {
        html += '<div class="row">'
        html += '<div class="columns">'
        html += `<div class="column col-6"><h5>Tipo: ${TypeEnum.get(parseInt(result.tipo))}</h5></div>`
        html += `<div class="column col-6"><div class="text-right"><h5>Data: ${dateFormat(result.data, 'dd/mm/yyyy')}</h5></div></div></br>`
        html += '<div class="column col-6"><h5>Descrição: </h5></div></br>'
        html += '</div>'
        html += `<div class="mx-2"><div class="text-left">${result.texto}</div></div></br>`
        html += '</div>'
        html += '<div class="divider"></div>'
        return html;
    }, '')

    document.getElementById('loading').style.display = "none";
    resultsDiv.innerHTML = resultsHtml;
})

ipcRenderer.on('query-permission', (event, results) => {
    var dataToSend = PatientController.encryptPatientData(results, remote.getGlobal('userEmail'), remote.getGlobal('userName'), remote.getGlobal('senderEmail'));
    ipcRenderer.send('send-data', dataToSend);
})

ipcRenderer.on('view-request', (event, request) => {
    const options = {
        type: 'info',
        buttons: ['Sim', 'Não'],
        title: 'Pedido de Permissão',
        cancelId: 1,
        message: `Uma pessoa da instituição ${request.sender} deseja acesso aos seus dados. Você deseja permitir?`
    };
    remote.dialog.showMessageBox(options, (response) => {
        if(response == 0){
            var email = remote.getGlobal('userEmail');
            var cpf = remote.getGlobal('userDocument');
            PatientController.queryResult(email, cpf, request.type, request.from, request.to, false);
        }
    });
})

ipcRenderer.on('stop-loading', () => {
    document.getElementById('loading').style.display = "none";
})