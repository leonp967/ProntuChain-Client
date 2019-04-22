'use strict'

const { ipcRenderer } = require('electron');
const PatientController = require('../backend/controllers/patient_controller');

document.getElementById('query-btn').addEventListener('click', () => {
    var type = document.getElementById('picker-type').value;
    var dateFrom = document.getElementById('date-from').value;
    var dateTo = document.getElementById('date-to').value;
    PatientController.queryResult(type, dateFrom, dateTo);
});
