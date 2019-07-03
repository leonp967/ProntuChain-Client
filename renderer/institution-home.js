const { ipcRenderer } = require('electron');
const remote = require('electron').remote;
const InstitutionController = require('../backend/controllers/institution_controller');
const dateFormat = require('dateformat');
const TypeEnum = require('../backend/models/types_enum').TypeEnum;

document.getElementById('permission-btn').addEventListener('click', () => {
    var type = document.getElementById('picker-type').value;
    var dateFrom = document.getElementById('date-from').value;
    var dateTo = document.getElementById('date-to').value;
    var cpf = document.getElementById('patient-cpf').value;
    var notificationData = {
        type: type, 
        from: dateFrom, 
        to: dateTo, 
        cpf: cpf, 
        sender: remote.getGlobal('userName'), 
        senderEmail: remote.getGlobal('userEmail')
    }
    ipcRenderer.send('view-permission', notificationData);
});

document.getElementById('create-btn').addEventListener('click', () => {
    ipcRenderer.send('create');
});

function showResults(results){
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
}

ipcRenderer.on('show-data', (event, data) => {
    const options = {
        type: 'info',
        buttons: ['Sim', 'Não'],
        title: 'Recebimento de dados',
        cancelId: 1,
        message: `O paciente ${data.patientName} permitiu que você acesse seus dados. Deseja visualizá-los agora?`
    };
    remote.dialog.showMessageBox(options, (response) => {
        if(response == 0){
            document.getElementById('loading').style.display = "block";
            let results = InstitutionController.decryptPatientData(data);
            showResults(results);
        }
    });
})

ipcRenderer.on('stop-loading', () => {
    document.getElementById('loading').style.display = "none";
})