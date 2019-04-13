var express = require('express');
var router = express.Router();

const PatientController = require('../controllers/patient_controller');

router.post('/query', PatientController.query);

module.exports = router;