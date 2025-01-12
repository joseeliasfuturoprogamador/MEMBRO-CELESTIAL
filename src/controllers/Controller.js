const userService = require('../services/userService');
const User = require('../models/UsuarioSchema');
const { json } = require('express');


const criarUsuario = async (req, res) => {
    const { nome, nascimento, endereco, bairro, filiacao, estadocivil, cpf, area, congregacao, dirigente, convencao, funcao, discipulado, batismo } = req.body
    if (!nome || !nascimento || !endereco || !bairro || !filiacao || !estadocivil || !cpf || !area || !congregacao || !dirigente || !convencao || !funcao || !discipulado || !batismo) {
        
        return res.status(400).json({message: "Todos os campos são obrigatórios" });
    }
    try {
        const { user } = await userService.criacaodeUsuario(req.body);
        res.status(201).json({ message: "Usuário criado com sucesso", user });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}