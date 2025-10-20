const dizimoService = require("../services/dizimo.Service");

// Criar novo dízimo
const criar = async (req, res) => {
  try {
    const igrejaId = req.headers["x-igreja-id"];
    if (!igrejaId) {
      return res.status(400).json({ message: "Cabeçalho X-Igreja-Id obrigatório." });
    }

    const { membro, valor, cargo, data, descricao } = req.body;
    if (!membro || !valor || !cargo || !data) {
      return res.status(400).json({ message: "Campos obrigatórios ausentes." });
    }

    const novoDizimo = await dizimoService.criarDizimo(
      { membro, valor, cargo, data, descricao },
      igrejaId
    );

    return res.status(201).json(novoDizimo);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Erro ao criar dízimo." });
  }
};

// Listar todos dízimos
const listar = async (req, res) => {
  try {
    const igrejaId = req.headers["x-igreja-id"];
    if (!igrejaId) {
      return res.status(400).json({ message: "Cabeçalho X-Igreja-Id obrigatório." });
    }

    const dizimos = await dizimoService.listarDizimos(igrejaId);
    return res.status(200).json(dizimos);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Erro ao listar dízimos." });
  }
};

// Obter dízimo por ID
const obterPorId = async (req, res) => {
  try {
    const igrejaId = req.headers["x-igreja-id"];
    const { id } = req.params;
    if (!igrejaId) {
      return res.status(400).json({ message: "Cabeçalho X-Igreja-Id obrigatório." });
    }
    if (!id) {
      return res.status(400).json({ message: "ID do dízimo é obrigatório." });
    }

    const dizimo = await dizimoService.obterDizimoPorId(id, igrejaId);
    if (!dizimo) {
      return res.status(404).json({ message: "Dízimo não encontrado." });
    }
    return res.status(200).json(dizimo);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Erro ao obter dízimo." });
  }
};

// Atualizar dízimo por ID
const atualizar = async (req, res) => {
  try {
    const igrejaId = req.headers["x-igreja-id"];
    const { id } = req.params;
    const { membro, valor, cargo, data, descricao } = req.body;

    if (!igrejaId) {
      return res.status(400).json({ message: "Cabeçalho X-Igreja-Id obrigatório." });
    }
    if (!id) {
      return res.status(400).json({ message: "ID do dízimo é obrigatório." });
    }
    if (!membro || !valor || !cargo || !data) {
      return res.status(400).json({ message: "Campos obrigatórios ausentes." });
    }

    const atualizado = await dizimoService.atualizarDizimo(
      id,
      { membro, valor, cargo, data, descricao },
      igrejaId
    );

    if (!atualizado) {
      return res.status(404).json({ message: "Dízimo não encontrado para atualizar." });
    }

    return res.status(200).json(atualizado);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Erro ao atualizar dízimo." });
  }
};

// Deletar dízimo por ID
const deletar = async (req, res) => {
  try {
    const igrejaId = req.headers["x-igreja-id"];
    const { id } = req.params;

    if (!igrejaId) {
      return res.status(400).json({ message: "Cabeçalho X-Igreja-Id obrigatório." });
    }
    if (!id) {
      return res.status(400).json({ message: "ID do dízimo é obrigatório." });
    }

    const removido = await dizimoService.deletarDizimo(id, igrejaId);
    if (!removido) {
      return res.status(404).json({ message: "Dízimo não encontrado para deletar." });
    }

    return res.status(200).json({ message: "Dízimo deletado com sucesso." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Erro ao deletar dízimo." });
  }
};

// Resumo mensal (ano obrigatório)
const resumoMensal = async (req, res) => {
  try {
    const igrejaId = req.headers["x-igreja-id"];
    const ano = parseInt(req.params.ano);

    if (!igrejaId) {
      return res.status(400).json({ message: "Cabeçalho X-Igreja-Id obrigatório." });
    }
    if (isNaN(ano) || ano < 2000) {
      return res.status(400).json({ message: "Ano inválido." });
    }

    const resumo = await dizimoService.obterBalancoPorAno(ano, igrejaId);

    if (!resumo || resumo.length === 0) {
      return res.status(200).json(
        Array.from({ length: 12 }, (_, i) => ({
          mes: i + 1,
          total: 0,
          quantidade: 0,
        }))
      );
    }

    return res.status(200).json(resumo);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Erro interno no servidor." });
  }
};

// Resumo anual (ano obrigatório)
const resumoAnual = async (req, res) => {
  try {
    const igrejaId = req.headers["x-igreja-id"];
    const ano = parseInt(req.params.ano);

    if (!igrejaId) {
      return res.status(400).json({ message: "Cabeçalho X-Igreja-Id obrigatório." });
    }
    if (isNaN(ano) || ano < 2000) {
      return res.status(400).json({ message: "Ano inválido." });
    }

    const resumo = await dizimoService.obterBalancoAnual(ano, igrejaId);

    if (!resumo) {
      return res.status(200).json({ total: 0, quantidade: 0 });
    }

    return res.status(200).json(resumo);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Erro interno no servidor." });
  }
};

module.exports = {
  criar,
  listar,
  obterPorId,
  atualizar,
  deletar,
  resumoMensal,
  resumoAnual,
};
