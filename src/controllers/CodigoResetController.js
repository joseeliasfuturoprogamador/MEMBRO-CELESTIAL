const Igreja = require('../models/IgrejaSchema');
const bcrypt = require('bcrypt');
const { enviarCodigoEmail } = require('../utils/emailUtils'); // ✅ Import corrigido

// Gera código numérico aleatório
function gerarCodigo(tamanho = 6) {
  return Math.floor(Math.random() * (10 ** tamanho)).toString().padStart(tamanho, '0');
}

// Cadastro com envio de código
const cadastrarIgreja = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const igrejaExistente = await Igreja.findOne({ $or: [{ nome }, { email }] });
    if (igrejaExistente) {
      return res.status(400).json({ message: 'Igreja já cadastrada com esse nome ou email.' });
    }

    const dbName = `igreja_${nome.toLowerCase().replace(/\s+/g, '')}`;
    const codigoConfirmacao = gerarCodigo();

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    const novaIgreja = new Igreja({
      nome,
      email,
      senha: senhaHash, // ✅ Salva a senha com hash
      dbName,
      codigoConfirmacao,
      confirmado: false,
    });

    await novaIgreja.save();

    // Envia código de confirmação por e-mail
    await enviarCodigoEmail(email, codigoConfirmacao, 'Código de confirmação do cadastro');

    return res.status(201).json({ message: 'Igreja cadastrada! Confirme seu cadastro pelo código enviado no email.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao cadastrar igreja' });
  }
};

// Confirmar cadastro
const confirmarCadastro = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    if (!email || !codigo) return res.status(400).json({ message: 'Email e código são obrigatórios' });

    const igreja = await Igreja.findOne({ email });
    if (!igreja) return res.status(400).json({ message: 'Email não cadastrado' });

    if (igreja.confirmado) return res.status(400).json({ message: 'Cadastro já confirmado' });

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

// Login só para igrejas confirmadas
const loginIgreja = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const igreja = await Igreja.findOne({ email });
    if (!igreja) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    if (!igreja.confirmado) {
      return res.status(403).json({ message: 'Confirme seu cadastro antes de fazer login' });
    }

    const senhaValida = await bcrypt.compare(senha, igreja.senha);
    if (!senhaValida) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    return res.status(200).json({ 
      message: 'Login realizado com sucesso!', 
      igrejaId: igreja._id, 
      dbName: igreja.dbName 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

// Solicitar código para redefinir senha
const solicitarResetSenha = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email é obrigatório' });

    const igreja = await Igreja.findOne({ email });
    if (!igreja) return res.status(400).json({ message: 'Email não cadastrado' });

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

// Redefinir senha com código
const redefinirSenha = async (req, res) => {
  try {
    const { email, codigo, novaSenha } = req.body;
    if (!email || !codigo || !novaSenha) return res.status(400).json({ message: 'Todos os campos são obrigatórios' });

    if (novaSenha.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    }

    const igreja = await Igreja.findOne({ email });
    if (!igreja) return res.status(400).json({ message: 'Email não cadastrado' });

    if (igreja.codigoSenhaReset !== codigo) {
      return res.status(400).json({ message: 'Código inválido' });
    }

    if (!igreja.codigoSenhaResetExpira || Date.now() > igreja.codigoSenhaResetExpira) {
      igreja.codigoSenhaReset = null;
      igreja.codigoSenhaResetExpira = null;
      await igreja.save();
      return res.status(400).json({ message: 'Código expirado. Solicite um novo.' });
    }

    const novaSenhaHash = await bcrypt.hash(novaSenha, 10); // ✅ Hash da nova senha
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
