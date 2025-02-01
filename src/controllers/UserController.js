const userService = require('../services/userService');
const User = require('../models/UsuarioSchema');

const criarUsuario = async (req, res) => {
    const { nome, nascimento, endereco, bairro, filiacao, estadocivil, cpf, area, congregacao, dirigente, convencao, funcao, discipulado, batismo } = req.body;
    if (!nome || !nascimento || !endereco || !bairro || !filiacao || !estadocivil || !cpf || !area || !congregacao || !dirigente || !convencao || !funcao || !discipulado || !batismo) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }
    try {
        const user = await userService.criacaoDeUsuario(req.body);
        res.status(201).json({ message: "Usuário criado com sucesso", user });
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar o Usuário" });
    }
};

const listarUsuarios = async (req, res) => {
    try {
        const users = await userService.listarUsuarios();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Ocorreu um erro ao listar Usuários" });
    }
};

const listarPorId = async (req, res) => {
    try {
        const user = await userService.listarPorId(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: "Erro ao listar Usuário por Id" });
    }
};

const AtualizarPorId = async (req, res) => {
    try {
        const user = await userService.atualizaUsuarioPorId(req.params.id, req.body, { new: true });
        res.status(200).json({ message: "Usuário Atualizado com sucesso!", user });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const DeletarPorId = async (req, res) => {
    try {
        await userService.deletarPorId(req.params.id);
        return res.status(200).json({ message: "Deletado com sucesso" });
    } catch (error) {
        res.status(404).json({ message: "Erro ao deletar Usuário" });
    }
};

const gerarCarta = async (req, res) => {
    try {
        const pdfBuffer = await userService.gerarCarta(req.params.id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="carta.pdf"',
        });
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: error.message });
    }
};

module.exports = {
    criarUsuario,
    listarUsuarios,
    listarPorId,
    AtualizarPorId,
    DeletarPorId,
    gerarCarta
};