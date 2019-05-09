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

ipcRenderer.on('query', (event, results) => {
    const resultsDiv = document.getElementById('results-div');
    const resultsHtml = results.reduce((html, result) => {
        html += '<div class="row">'
        html += '<div class="columns">'
        html += `<div class="column col-6"><h5>Tipo: ${result.tipo}</h5></div>`
        html += `<div class="column col-6"><div class="text-right"><h5>Data: ${result.data}</h5></div></div></br>`
        html += '<div class="column col-6"><h5>Descrição: </h5></div></br>'
        html += '</div>'
        html += `<div class="mx-2"><div class="text-left">${result.texto}</div></div></br>`
        html += '</div>'
        html += '<div class="divider"></div>'
        return html;
    }, '')

    resultsDiv.innerHTML = resultsHtml;
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
            options.message = 'Acertô miseravi';
            remote.dialog.showMessageBox(options);
        }
    });
})
