const express = require('express');
const router = express.Router()
const userController = require('../controllers/UserController')


router.post('/users', userController.criarUsuario);
router.put('/users', userController.listarUsuarios);
router.delete('/users/:id', userController.DeletarPorId);

module.exports = router