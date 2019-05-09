const { ipcRenderer } = require('electron');
const remote = require('electron').remote;

document.getElementById('permission-btn').addEventListener('click', () => {
    var type = document.getElementById('picker-type').value;
    var dateFrom = document.getElementById('date-from').value;
    var dateTo = document.getElementById('date-to').value;
    var cpf = document.getElementById('patient-cpf').value;
    ipcRenderer.send('view-permission', {type: type, from: dateFrom, to: dateTo, cpf: cpf, sender: remote.getGlobal('userName')});
});