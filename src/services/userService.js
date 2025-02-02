const User = require('../models/UsuarioSchema');
const path = require('path');
const pdf = require('html-pdf');
const { create } = require('express-handlebars');
const fs = require('fs');

// Configuração do Handlebars
const hbs = create({
    extname: '.handlebars',
    defaultLayout: false,
});

// Função genérica para tratamento de erros
const handleError = (error, customMessage) => {
    console.error(`${customMessage}:`, error.message);
    throw new Error(`${customMessage}: ${error.message}`);
};

const criacaoDeUsuario = async (userdata) => {
    try {
        if (!userdata.nome || !userdata.email) {
            throw new Error('Nome e e-mail são obrigatórios.');
        }
        return await User.create(userdata);
    } catch (error) {
        handleError(error, 'Erro ao criar usuário');
    }
};

const listarUsuarios = async () => {
    try {
        return await User.find();
    } catch (error) {
        handleError(error, 'Erro ao listar usuários');
    }
};

const listarPorId = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) throw new Error('Usuário não encontrado');
        return user;
    } catch (error) {
        handleError(error, 'Erro ao buscar usuário');
    }
};

const atualizaUsuarioPorId = async (id, updateData) => {
    try {
        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!user) throw new Error('Usuário não encontrado');
        return user;
    } catch (error) {
        handleError(error, 'Erro ao atualizar usuário');
    }
};

const deletarPorId = async (id) => {
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new Error("Usuário não encontrado");
        return user;
    } catch (error) {
        handleError(error, 'Erro ao deletar usuário');
    }
};

const compileTemplate = async (templatePath, data) => {
    try {
        const templateFile = fs.readFileSync(templatePath, 'utf-8');
        const template = hbs.handlebars.compile(templateFile);
        return template(data);
    } catch (error) {
        handleError(error, 'Erro ao compilar template');
    }
};

const gerarCarta = async (id) => {
    try {
        const membro = await User.findById(id).lean();
        if (!membro) throw new Error("Membro não encontrado");

        if (membro.nascimento) {
            membro.nascimento = new Date(membro.nascimento).toLocaleDateString('pt-BR');
        }

        const logoPath = path.resolve(__dirname, '../imagens/logo.png');  // Alterando para o formato .png
        const logoBase64 = fs.readFileSync(logoPath, 'base64');
        membro.logoBase64 = `data:image/png;base64,${logoBase64}`;  // Alterando para 'image/png'
        
        const ceadema = path.resolve(__dirname, '../imagens/OIP.jpg');  // Alterando para o formato .png
        const ceademaBase64 = fs.readFileSync(ceadema, 'base64');
        membro.ceademaBase64 = `data:image/png;base64,${ceademaBase64}`;  // Alterando para 'image/png'
        
    

        const templatePath = path.join(__dirname, '../geradordecarta/carta.handlebars');
        const html = await compileTemplate(templatePath, membro);

        return new Promise((resolve, reject) => {
            pdf.create(html).toBuffer((err, buffer) => {
                if (err) reject(err);
                else resolve(buffer);
            });
        });

    } catch (error) {
        throw new Error("Erro ao gerar a carta: " + error.message);
    }
};

module.exports = {
    criacaoDeUsuario,
    listarUsuarios,
    listarPorId,
    atualizaUsuarioPorId,
    deletarPorId,
    gerarCarta
};
