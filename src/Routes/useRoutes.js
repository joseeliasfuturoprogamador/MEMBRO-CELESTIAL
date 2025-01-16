const express = require ('express');
const router = express.Router()
const userController = require ('../controllers/UserController')


router.post('/users', userController.criarUsuario);

module.exports = router