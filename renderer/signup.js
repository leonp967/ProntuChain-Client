const { ipcRenderer } = require('electron')
const UserController = require('../backend/controllers/user_controller')
const dialog = require('electron').remote.dialog

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
    // prevent default refresh functionality of forms
    evt.preventDefault();
  
    const form = document.getElementById('signupForm');
    // input on the form
    const email = form[0].value;
    const cpf = form[1].value;
    const nome = form[2].value;
    const senha = form[3].value;
  
    UserController.createUser(email, senha, cpf, nome);
  })