const express = require('express');
const router = express.Router();
const igrejaController = require('../controllers/igrejaController');

router.post('/cadastrar', igrejaController.cadastrarIgreja);
router.post('/confirmar', igrejaController.confirmarCadastro);
router.post('/login', igrejaController.loginIgreja);
router.post('/solicitar-reset', igrejaController.solicitarResetSenha);
router.post('/redefinir-senha', igrejaController.redefinirSenha);

module.exports = router;
 