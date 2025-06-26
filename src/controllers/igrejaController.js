const bcrypt = require('bcrypt');
const { enviarCodigoEmail } = require('../utils/emailUtils');
const connect = require('../database/connection');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Função para gerar código numérico aleatório com tamanho definido (default 6 dígitos)
function gerarCodigo(tamanho = 6) {
  return Math.floor(Math.random() * (10 ** tamanho)).toString().padStart(tamanho, '0');
}

// Importa só o schema da Igreja (exporte só o schema no model IgrejaSchema.js)
const igrejaSchema = require('../models/IgrejaSchema').schema;

// Função para criar o model Igreja na conexão especificada (evita OverwriteModelError)
const getIgrejaModel = (connection) => {
  return connection.models.Igreja || connection.model('Igreja', igrejaSchema);
};

// Nome fixo do banco global onde ficam os dados gerais das igrejas
const GLOBAL_DB_NAME = 'igrejas_global';

// Função para pegar o model Igreja do banco global
async function getGlobalIgrejaModel() {
  const globalConn = await connect(GLOBAL_DB_NAME);
  return getIgrejaModel(globalConn);
}

// Cadastro da igreja (salva no banco global)
const cadastrarIgreja = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const IgrejaGlobal = await getGlobalIgrejaModel();

    // Verifica se já existe igreja com mesmo nome ou email
    const igrejaExistente = await IgrejaGlobal.findOne({ $or: [{ nome }, { email }] });
    if (igrejaExistente) {
      return res.status(400).json({ message: 'Igreja já cadastrada com esse nome ou email.' });
    }

    // Cria nome do banco individual para essa igreja
    const dbName = `igreja_${nome.toLowerCase().replace(/\s+/g, '')}`;
    const codigoConfirmacao = gerarCodigo();

    const novaIgreja = new IgrejaGlobal({
      nome,
      email,
      senha,
      dbName,
      codigoConfirmacao,
      confirmado: false,
    });

    await novaIgreja.save();

    // Cria conexão para o banco da igreja (se necessário para inicializar)
    await connect(dbName);

    // Envia email com código de confirmação
    await enviarCodigoEmail(email, codigoConfirmacao, 'Código de confirmação do cadastro');

    return res.status(201).json({ message: 'Igreja cadastrada! Confirme seu cadastro pelo código enviado no email.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao cadastrar igreja' });
  }
};

// Confirmar cadastro da igreja com código enviado por email
const confirmarCadastro = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    if (!email || !codigo) {
      return res.status(400).json({ message: 'Email e código são obrigatórios' });
    }

    const IgrejaGlobal = await getGlobalIgrejaModel();

    const igreja = await IgrejaGlobal.findOne({ email });
    if (!igreja) {
      return res.status(400).json({ message: 'Email não cadastrado' });
    }

    if (igreja.confirmado) {
      return res.status(400).json({ message: 'Cadastro já confirmado' });
    }

    if (igreja.codigoConfirmacao !== codigo) {
      return res.status(400).json({ message: 'Código inválido' });
    }

    igreja.confirmado = true;
    igreja.codigoConfirmacao = null;
    await igreja.save();

    return res.status(200).json({ message: 'Cadastro confirmado com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao confirmar cadastro' });
  }
};

// Login para igreja confirmada
const loginIgreja = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const IgrejaGlobal = await getGlobalIgrejaModel();

    const igreja = await IgrejaGlobal.findOne({ email });
    if (!igreja) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    if (!igreja.confirmado) {
      return res.status(403).json({ message: 'Confirme seu cadastro antes de fazer login' });
    }

    // Compara senha recebida com hash no banco
    const senhaValida = await bcrypt.compare(senha, igreja.senha);
    if (!senhaValida) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Aqui pode gerar token JWT, por exemplo (não implementado neste código)

    return res.status(200).json({ 
      message: 'Login realizado com sucesso!', 
      idIgreja: igreja._id,    // <-- corrigido para idIgreja
      dbName: igreja.dbName 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

// Solicitar código para resetar senha
const solicitarResetSenha = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const IgrejaGlobal = await getGlobalIgrejaModel();

    const igreja = await IgrejaGlobal.findOne({ email });
    if (!igreja) {
      return res.status(400).json({ message: 'Email não cadastrado' });
    }

    const codigoSenhaReset = gerarCodigo();
    igreja.codigoSenhaReset = codigoSenhaReset;
    igreja.codigoSenhaResetExpira = Date.now() + 3600000; // Código válido por 1 hora
    await igreja.save();

    await enviarCodigoEmail(email, codigoSenhaReset, 'Código para redefinir senha');

    return res.status(200).json({ message: 'Código para redefinir senha enviado para o email.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao solicitar redefinição de senha' });
  }
};

// Redefinir senha com código enviado por email
const redefinirSenha = async (req, res) => {
  try {
    const { email, codigo, novaSenha } = req.body;
    if (!email || !codigo || !novaSenha) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const IgrejaGlobal = await getGlobalIgrejaModel();

    const igreja = await IgrejaGlobal.findOne({ email });
    if (!igreja) {
      return res.status(400).json({ message: 'Email não cadastrado' });
    }

    if (igreja.codigoSenhaReset !== codigo) {
      return res.status(400).json({ message: 'Código inválido' });
    }

    if (Date.now() > igreja.codigoSenhaResetExpira) {
      return res.status(400).json({ message: 'Código expirado' });
    }

    // Atualiza senha (passa pelo pre-save que faz hash)
    igreja.senha = novaSenha;
    igreja.codigoSenhaReset = null;
    igreja.codigoSenhaResetExpira = null;

    await igreja.save();

    return res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao redefinir senha' });
  }
};

module.exports = {
  cadastrarIgreja,
  confirmarCadastro,
  loginIgreja,
  solicitarResetSenha,
  redefinirSenha,
};
