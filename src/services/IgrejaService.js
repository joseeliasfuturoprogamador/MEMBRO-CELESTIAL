const Igreja = require('../models/IgrejaSchema');
const bcrypt = require('bcrypt');
const { enviarCodigoEmail } = require('../utils/email');

function gerarCodigo(tamanho = 6) {
  return Math.floor(Math.random() * (10 ** tamanho)).toString().padStart(tamanho, '0');
}

async function cadastrarIgrejaService({ nome, email, senha }) {
  const igrejaExistente = await Igreja.findOne({ $or: [{ nome }, { email }] });
  if (igrejaExistente) {
    throw new Error('Igreja já cadastrada com esse nome ou email.');
  }

  const dbName = `igreja_${nome.toLowerCase().replace(/\s+/g, '')}`;
  const codigoConfirmacao = gerarCodigo();

  const novaIgreja = new Igreja({
    nome,
    email,
    senha,
    dbName,
    codigoConfirmacao,
    confirmado: false,
  });

  await novaIgreja.save();
  await enviarCodigoEmail(email, codigoConfirmacao, 'Código de confirmação do cadastro');

  return 'Igreja cadastrada! Confirme seu cadastro pelo código enviado no email.';
}

async function confirmarCadastroService(email, codigo) {
  const igreja = await Igreja.findOne({ email });
  if (!igreja) throw new Error('Email não cadastrado');
  if (igreja.confirmado) throw new Error('Cadastro já confirmado');
  if (igreja.codigoConfirmacao !== codigo) throw new Error('Código inválido');

  igreja.confirmado = true;
  igreja.codigoConfirmacao = null;
  await igreja.save();

  return 'Cadastro confirmado com sucesso!';
}

async function loginIgrejaService(email, senha) {
  const igreja = await Igreja.findOne({ email });
  if (!igreja || !igreja.confirmado) {
    throw new Error('Credenciais inválidas ou igreja não confirmada');
  }

  const senhaValida = await bcrypt.compare(senha, igreja.senha);
  if (!senhaValida) {
    throw new Error('Credenciais inválidas');
  }

  return { igrejaId: igreja._id, dbName: igreja.dbName };
}

async function solicitarResetSenhaService(email) {
  const igreja = await Igreja.findOne({ email });
  if (!igreja) throw new Error('Email não cadastrado');

  const codigo = gerarCodigo();
  igreja.codigoSenhaReset = codigo;
  igreja.codigoSenhaResetExpira = Date.now() + 3600000; // 1 hora
  await igreja.save();

  await enviarCodigoEmail(email, codigo, 'Código para redefinir senha');

  return 'Código para redefinir senha enviado para o email.';
}

async function redefinirSenhaService(email, codigo, novaSenha) {
  const igreja = await Igreja.findOne({ email });
  if (!igreja) throw new Error('Email não cadastrado');
  if (igreja.codigoSenhaReset !== codigo) throw new Error('Código inválido');
  if (Date.now() > igreja.codigoSenhaResetExpira) throw new Error('Código expirado');

  igreja.senha = novaSenha;
  igreja.codigoSenhaReset = null;
  igreja.codigoSenhaResetExpira = null;
  await igreja.save();

  return 'Senha redefinida com sucesso!';
}

module.exports = {
  cadastrarIgrejaService,
  confirmarCadastroService,
  loginIgrejaService,
  solicitarResetSenhaService,
  redefinirSenhaService,
};
