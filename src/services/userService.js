const User = require('../models/UsuarioSchema');
const path = require('path');
const pdf = require('html-pdf');
const { create } = require('express-handlebars');

// Configuração do Handlebars
const hbs = create({
    extname: '.handlebars',
    defaultLayout: false,
});

const criacaoDeUsuario = async (userdata) => {
    try {
        return await User.create(userdata);
    } catch (error) {
        throw new Error('Erro ao criar usuário: ' + error.message);
    }
};

const listarUsuarios = async () => {
    try {
        return await User.find();
    } catch (error) {
        throw new Error('Erro ao listar usuários: ' + error.message);
    }
};

const listarPorId = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) throw new Error('Usuário não encontrado');
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const atualizaUsuarioPorId = async (id, updateData) => {
    try {
        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!user) throw new Error('Usuário não encontrado');
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const deletarPorId = async (id) => {
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new Error("Usuário não encontrado");
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

const compileTemplate = async (templatePath, data) => {
    try {
        const templateFile = require('fs').readFileSync(templatePath, 'utf-8');
        const template = hbs.handlebars.compile(templateFile);
        return template(data);
    } catch (error) {
        throw new Error('Erro ao compilar template: ' + error.message);
    }
};

const gerarCarta = async (id) => {
    try {
        const membro = await User.findById(id);
        if (!membro) throw new Error("Membro não encontrado");

        console.log("Membro encontrado", membro)

        membro.nascimento = new Date(membro.nascimento).toLocaleDateString('pt-BR');
        membro.batismo = new Date(membro.batismo).toLocaleDateString('pt-BR');


        const templatePath = path.join(__dirname, '../geradordecarta/carta.handlebars');

        const html = await compileTemplate(templatePath, membro);

        return new Promise((resolve, reject) => {
            pdf.create(html).toBuffer((err, buffer) => {
                if (err) reject(err);
                else resolve(buffer);
            });
        });

    } catch (error) {
        throw new Error("Erro ao gerar a carta" + error.message);
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
