const mongoose = require('mongoose');
const userService = require('../services/userService');

// Função auxiliar para obter o ID da igreja
const getIgrejaId = (req) => {
  return req.headers['x-igreja-id'];
};

// Criar Usuário
const criarUsuario = async (req, res) => {
  const igreja = getIgrejaId(req);
  if (!igreja) {
    return res.status(400).json({ message: "Cabeçalho 'X-Igreja-Id' é obrigatório" });
  }

  const userData = { ...req.body, igreja };

  try {
    const user = await userService.criarUsuario(userData);
    res.status(201).json({ message: "Usuário criado com sucesso", user });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar o usuário", error: error.message });
  }
};

// Listar todos os usuários
const listarUsuarios = async (req, res) => {
  const igreja = getIgrejaId(req);
  if (!igreja) {
    return res.status(400).json({ message: "Cabeçalho 'X-Igreja-Id' é obrigatório" });
  }

  try {
    const users = await userService.listarUsuarios(igreja);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar usuários", error: error.message });
  }
};

// Listar usuário por ID
const listarPorId = async (req, res) => {
  const id = req.params.id;
  const igreja = getIgrejaId(req);

  if (!igreja) return res.status(400).json({ message: "Cabeçalho 'X-Igreja-Id' é obrigatório" });
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID inválido" });

  try {
    const user = await userService.listarPorId(id, igreja);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar usuário", error: error.message });
  }
};

// Atualizar usuário
const atualizarPorId = async (req, res) => {
  const id = req.params.id;
  const igreja = getIgrejaId(req);

  if (!igreja) return res.status(400).json({ message: "Cabeçalho 'X-Igreja-Id' é obrigatório" });
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID inválido" });

  try {
    const user = await userService.atualizaUsuarioPorId(id, req.body, igreja);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado para atualização" });
    res.status(200).json({ message: "Usuário atualizado com sucesso", user });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar usuário", error: error.message });
  }
};

// Deletar usuário
const deletarPorId = async (req, res) => {
  const id = req.params.id;
  const igreja = getIgrejaId(req);

  if (!igreja) return res.status(400).json({ message: "Cabeçalho 'X-Igreja-Id' é obrigatório" });
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID inválido" });

  try {
    const user = await userService.deletarPorId(id, igreja);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado para deletar" });
    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar usuário", error: error.message });
  }
};

// Gerar carta
const gerarCarta = async (req, res) => {
  const igreja = getIgrejaId(req);

  if (!igreja) return res.status(400).json({ message: "Cabeçalho 'X-Igreja-Id' é obrigatório" });

  try {
    const pdfBuffer = await userService.gerarCarta(req.params.id, igreja);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="carta.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: "Erro ao gerar carta", error: error.message });
  }
};

module.exports = {
  criarUsuario,
  listarUsuarios,
  listarPorId,
  atualizarPorId,
  deletarPorId,
  gerarCarta,
};
