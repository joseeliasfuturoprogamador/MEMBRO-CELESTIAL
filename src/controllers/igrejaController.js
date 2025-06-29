const bcrypt = require('bcrypt');
const { enviarCodigoEmail } = require('../utils/emailUtils');
const connect = require('../database/connection');

// Função para gerar código numérico aleatório (6 dígitos)
function gerarCodigo(tamanho = 6) {
  return Math.floor(Math.random() * (10 ** tamanho)).toString().padStart(tamanho, '0');
}

// Importa o schema
const igrejaSchema = require('../models/IgrejaSchema').schema;

// Cria model Igreja na conexão especificada
const getIgrejaModel = (connection) => {
  return connection.models.Igreja || connection.model('Igreja', igrejaSchema);
};

// Nome fixo do banco global
const GLOBAL_DB_NAME = 'igrejas_global';

// Pega model Igreja do banco global
async function getGlobalIgrejaModel() {
  const globalConn = await connect(GLOBAL_DB_NAME);
  return getIgrejaModel(globalConn);
}

// Cadastro da igreja com hash explícito na senha
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

    // Cria nome do banco individual
    const dbName = `igreja_${nome.toLowerCase().replace(/\s+/g, '')}`;
    const codigoConfirmacao = gerarCodigo();

    // Faz hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const novaIgreja = new IgrejaGlobal({
      nome,
      email,
      senha: senhaHash,
      dbName,
      codigoConfirmacao,
      confirmado: false,
    });

    await novaIgreja.save();

    // Inicializa banco individual
    await connect(dbName);

    // Envia código de confirmação por email
    await enviarCodigoEmail(email, codigoConfirmacao, 'Código de confirmação do cadastro');

    return res.status(201).json({ message: 'Igreja cadastrada! Confirme seu cadastro pelo código enviado no email.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao cadastrar igreja' });
  }
};

// Confirmar cadastro com código enviado por email
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

    return res.status(200).json({ 
      message: 'Cadastro confirmado com sucesso!',
      idIgreja: igreja._id.toString()
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao confirmar cadastro' });
  }
};

// Login para igreja confirmada com comparação bcrypt
const loginIgreja = async (req, res) => {
  try {
    const { nome, senha } = req.body;

    console.log('🔐 Login iniciado');
    console.log('📨 Dados recebidos:', { nome, senha });

    if (!nome || !senha) {
      return res.status(400).json({ message: 'Nome e senha são obrigatórios' });
    }

    const IgrejaGlobal = await getGlobalIgrejaModel();

    const igreja = await IgrejaGlobal.findOne({ 
      $or: [
        { nome: nome },
        { email: nome }
      ]
    });

    if (!igreja) {
      console.log('❌ Igreja não encontrada com nome ou email:', nome);
      return res.status(400).json({ message: 'Igreja não encontrada. Verifique o nome ou e-mail.' });
    }

    if (!igreja.confirmado) {
      console.log('⚠️ Igreja ainda não confirmada:', igreja.nome);
      return res.status(403).json({ message: 'Confirme seu cadastro antes de fazer login.' });
    }

    const senhaValida = await bcrypt.compare(senha, igreja.senha);

    console.log('✅ Senha válida?', senhaValida);

    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    console.log('✅ Login realizado com sucesso:', igreja.nome);

    return res.status(200).json({ 
      message: 'Login realizado com sucesso!', 
      idIgreja: igreja._id,
      dbName: igreja.dbName,
      primeiraVez: false,
    });

  } catch (error) {
    console.error('🔥 Erro no login:', error);
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
    igreja.codigoSenhaResetExpira = Date.now() + 3600000; // 1 hora
    await igreja.save();

    await enviarCodigoEmail(email, codigoSenhaReset, 'Código para redefinir senha');

    return res.status(200).json({ message: 'Código para redefinir senha enviado para o email.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao solicitar redefinição de senha' });
  }
};

// Redefinir senha com código — salva com hash
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

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    igreja.senha = novaSenhaHash;
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
