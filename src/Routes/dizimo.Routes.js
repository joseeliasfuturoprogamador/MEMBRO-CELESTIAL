const express = require('express');
const router = express.Router();
const dizimoController = require('../controllers/dizimo.Controller');

// ROTAS DE DÍZIMOS
router.post('/dizimos', dizimoController.criar);                        // Criar novo dízimo
router.get('/dizimos', dizimoController.listar);                        // Listar todos os dízimos
router.get('/dizimos/:id', dizimoController.obterPorId);                // Obter dízimo por ID
router.put('/dizimos/:id', dizimoController.atualizar);                 // Atualizar dízimo por ID
router.delete('/dizimos/:id', dizimoController.deletar);                // Deletar dízimo por ID

// ROTAS DE BALANÇO - agora com parâmetro ano obrigatório
router.get('/dizimos/resumo/mensal/:ano', dizimoController.resumoMensal); // Resumo mensal por ano
router.get('/dizimos/resumo/anual/:ano', dizimoController.resumoAnual);   // Resumo anual para o ano informado

module.exports = router;
