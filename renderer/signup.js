const { ipcRenderer } = require('electron');
const UserController = require('../backend/controllers/user_controller');
const dialog = require('electron').remote.dialog;
const ValidationUtils = require('../backend/utils/validation_utils');

ipcRenderer.on('signup-check', (event, response) => {
    if(response == 201){
        const options = {
            type: 'info',
            buttons: ['OK'],
            title: 'Aviso',
            message: 'Cadastro realizado com sucesso!'
        };
        dialog.showMessageBox(null, options);
        ipcRenderer.send('signup-ok');
    }
})

document.getElementById('confirm-button').addEventListener('click', async(evt) => {
    evt.preventDefault();
    document.getElementById('loading').style.display = "block";
    const form = document.getElementById('signupForm');
    const email = form[0].value;
    const documentNumber = form[1].value;
    const name = form[2].value;
    const password = form[3].value;

    let error;
    if (!email || !documentNumber || !name || !password)
        error = 'Todos os campos são obrigatórios!'
    else if (!ValidationUtils.validateEmail(email))
        error = 'E-mail inválido!'
    else if (!ValidationUtils.isNumeric(documentNumber))
        error = 'Apenas números positivos são permitidos no número de documento!'
    else if (documentNumber.length != 11 && documentNumber.length != 14)
        error = 'O número de documento deve ter 11 caracteres (CPF) ou 14 (CNPJ)!'

    if (error){
        const options = {
            type: 'error',
            buttons: ['OK'],
            title: 'Erro',
            message: error
        };
        dialog.showMessageBox(null, options);
        document.getElementById('loading').style.display = "none";
    } else 
        UserController.createUser(email, password, documentNumber, name);
})

ipcRenderer.on('stop-loading', () => {
    document.getElementById('loading').style.display = "none";
})