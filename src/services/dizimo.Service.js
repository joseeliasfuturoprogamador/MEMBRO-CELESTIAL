const DizimoSchema = require("../models/dizimoSchema");
const connect = require("../database/connection");

const getDizimoModel = async (igreja) => {
  if (!igreja) throw new Error("Identificador da igreja não fornecido.");
  const connection = await connect(igreja);
  return connection.model("Dizimo", DizimoSchema);
};

const criarDizimo = async (data, igreja) => {
  try {
    const Dizimo = await getDizimoModel(igreja);
    return await Dizimo.create(data);
  } catch (error) {
    throw new Error(`Erro ao criar dízimo: ${error.message}`);
  }
};

const listarDizimos = async (igreja) => {
  try {
    const Dizimo = await getDizimoModel(igreja);
    return await Dizimo.find().sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Erro ao listar dízimos: ${error.message}`);
  }
};

const deletarDizimo = async (id, igreja) => {
  try {
    const Dizimo = await getDizimoModel(igreja);
    return await Dizimo.findByIdAndDelete(id);
  } catch (error) {
    throw new Error(`Erro ao deletar dízimo: ${error.message}`);
  }
};

const obterDizimoPorId = async (id, igreja) => {
  try {
    const Dizimo = await getDizimoModel(igreja);
    return await Dizimo.findById(id);
  } catch (error) {
    throw new Error(`Erro ao obter dízimo: ${error.message}`);
  }
};

const atualizarDizimo = async (id, data, igreja) => {
  try {
    const Dizimo = await getDizimoModel(igreja);
    return await Dizimo.findByIdAndUpdate(id, data, { new: true });
  } catch (error) {
    throw new Error(`Erro ao atualizar dízimo: ${error.message}`);
  }
};

// Balanço mensal com entrada e saída separadas
const obterBalancoPorAno = async (ano, igreja) => {
  try {
    const Dizimo = await getDizimoModel(igreja);

    const inicioAno = new Date(ano, 0, 1);
    const fimAno = new Date(ano + 1, 0, 1);

    const resultado = await Dizimo.aggregate([
      {
        $match: {
          data: { $gte: inicioAno, $lt: fimAno },
        }
      },
      {
        $group: {
          _id: { mes: { $month: "$data" }, tipo: "$tipo" },
          total: { $sum: "$valor" },
          count: { $sum: 1 },
        }
      },
      {
        $sort: { "_id.mes": 1 }
      }
    ]);

    // Montar estrutura para retorno: para cada mês, total entrada e saída
    const balancoMensal = Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const entrada = resultado.find(r => r._id.mes === mes && r._id.tipo === "entrada");
      const saida = resultado.find(r => r._id.mes === mes && r._id.tipo === "saida");

      return {
        mes,
        entrada: entrada ? entrada.total : 0,
        saida: saida ? saida.total : 0,
        quantidadeEntrada: entrada ? entrada.count : 0,
        quantidadeSaida: saida ? saida.count : 0,
      };
    });

    return balancoMensal;

  } catch (error) {
    throw new Error(`Erro ao obter balanço mensal: ${error.message}`);
  }
};

// Balanço anual total (entrada menos saída)
const obterBalancoAnual = async (ano, igreja) => {
  try {
    const Dizimo = await getDizimoModel(igreja);

    const inicioAno = new Date(ano, 0, 1);
    const fimAno = new Date(ano + 1, 0, 1);

    const resultado = await Dizimo.aggregate([
      {
        $match: {
          data: { $gte: inicioAno, $lt: fimAno },
        }
      },
      {
        $group: {
          _id: "$tipo",
          total: { $sum: "$valor" },
        }
      }
    ]);

    let totalEntrada = 0;
    let totalSaida = 0;

    resultado.forEach(r => {
      if (r._id === "entrada") totalEntrada = r.total;
      else if (r._id === "saida") totalSaida = r.total;
    });

    return {
      total: totalEntrada - totalSaida,
      entrada: totalEntrada,
      saida: totalSaida,
    };

  } catch (error) {
    throw new Error(`Erro ao obter balanço anual: ${error.message}`);
  }
};

module.exports = {
  criarDizimo,
  listarDizimos,
  deletarDizimo,
  obterDizimoPorId,
  atualizarDizimo,
  obterBalancoPorAno,
  obterBalancoAnual,
};
