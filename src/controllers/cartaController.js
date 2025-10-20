const userService = require('../services/userService');
const Igreja = require('../models/igreja'); // Model da igreja
const { gerarCartaPDF } = require('../services/cartaService');

// Função auxiliar para obter o ID da igreja do cabeçalho
const getIgrejaId = (req) => req.headers['x-igreja-id'];

/**
 * Gera a carta em PDF de um usuário/membro
 */
const gerarCarta = async (req, res) => {
  const igrejaId = getIgrejaId(req);
  if (!igrejaId) return res.status(400).json({ message: "Cabeçalho 'X-Igreja-Id' é obrigatório" });

  try {
    // 1. Buscar usuário pelo ID
    const usuario = await userService.listarPorId(req.params.id, igrejaId);
    if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

    // 2. Buscar igreja pelo ID
    const igreja = await Igreja.findById(igrejaId);
    if (!igreja) return res.status(404).json({ message: "Igreja não encontrada" });

    // 3. Gerar PDF da carta
    const pdfBuffer = await gerarCartaPDF(usuario, igreja);

    // 4. Retornar PDF como download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=carta_${usuario.nome}.pdf`,
    });
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Erro ao gerar carta:", error);
    res.status(500).json({ message: "Erro ao gerar carta", error: error.message });
  }
};

module.exports = { gerarCarta };

