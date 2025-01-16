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
};

const listarUsuarios =  async (req, res) => {
    try{
        const users = await userService.listarUsuarios();
        res.status(200).json(users);
    } catch (error) {
     res.status(500).json({message: "Ocorreu um erro ao listar Usuários"});
    }
};

const listarPorId = async (req, res) => {
    try{
        const users = await userService.listarPorId(req.params.id);
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({message: "Erro ao listar Usuários pot Id"});
    }
};

const AtualizarPorId = async (req, res) => {
    try{
 const users = await userServic.AtualizarPorId(req.params.id, req.body);
 res.status(200).json(users)
    } catch (error){
        res.status(404).json({ message: "Erro ao atualizar por Id"});
    }
}

const DeletarPorId = async (req, res) => {
    try{
        await userService.deletarPorId(req.params.id);
        return res.status(200).json({message: "Deletado com sucesso"})
    } catch (error) {
        res.status(404).json({ message: "Erro ao deletar Usuário"});
    }
}


module.exports = {
    criarUsuario,
    listarUsuarios,
    listarPorId,
    AtualizarPorId,
    DeletarPorId,   
}