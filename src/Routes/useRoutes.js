const express = require('express');
const router = express.Router()
const userController = require('../controllers/UserController')


router.post('/users', userController.criarUsuario);
router.get('/users', userController.listarUsuarios);
router.get('/users/:id', userController.listarPorId);
router.put('/users/:id', userController.AtualizarPorId);
router.delete('/users/:id', userController.DeletarPorId);

module.exports = router