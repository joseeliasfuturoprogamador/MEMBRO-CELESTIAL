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
    return new Error(`${customMessage}: ${error.message}`);
};

// Criar Usuário
const criarUsuario = async (userData) => {
    try {
        return await User.create(userData);
    } catch (error) {
        throw handleError(error, 'Erro ao criar usuário');
    }
};

// Listar todos os usuários
const listarUsuarios = async () => {
    try {
        return await User.find();
    } catch (error) {
        throw handleError(error, 'Erro ao listar usuários');
    }
};

// Listar usuário por ID
const listarPorId = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) throw new Error('Usuário não encontrado');
        return user;
    } catch (error) {
        throw handleError(error, 'Erro ao buscar usuário');
    }
};

// Atualizar usuário por ID
const atualizaUsuarioPorId = async (id, updateData) => {
    try {
        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!user) throw new Error('Usuário não encontrado');
        return user;
    } catch (error) {
        throw handleError(error, 'Erro ao atualizar usuário');
    }
};

// Deletar usuário por ID
const deletarPorId = async (id) => {
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new Error("Usuário não encontrado");
        return user;
    } catch (error) {
        throw handleError(error, 'Erro ao deletar usuário');
    }
};

// Compilar Template Handlebars
const compileTemplate = async (templatePath, data) => {
    try {
        const templateFile = fs.readFileSync(templatePath, 'utf-8');
        const template = hbs.handlebars.compile(templateFile);
        return template(data);
    } catch (error) {
        throw handleError(error, 'Erro ao compilar template');
    }
};

// Gerar Carta em PDF
const gerarCarta = async (id) => {
    try {
        const membro = await User.findById(id).lean();
        if (!membro) throw new Error("Membro não encontrado");

        // Formatar data de batismo (se houver)
        if (membro.batismo) {
            membro.batismo = new Date(membro.nascimento).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        }

        // Gerar data atual formatada
        const dataAtual = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Carregar imagens e converter para Base64
        const logoPath = path.resolve(__dirname, '../imagens/logo.png');
        const ceademaPath = path.resolve(__dirname, '../imagens/OIP.jpg');
        
        membro.logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath, 'base64')}`;
        membro.ceademaBase64 = `data:image/jpg;base64,${fs.readFileSync(ceademaPath, 'base64')}`;

        // Adicionar a data formatada ao objeto `membro`
        membro.dataAtual = dataAtual;

        // Compilar HTML do template
        const templatePath = path.join(__dirname, '../geradordecarta/carta.handlebars');
        const html = await compileTemplate(templatePath, membro);

        return new Promise((resolve, reject) => {
            pdf.create(html).toBuffer((err, buffer) => {
                if (err) reject(err);
                else resolve(buffer);
            });
        });

    } catch (error) {
        throw handleError(error, "Erro ao gerar a carta");
    }
};
// Exportar os serviços
module.exports = {
    criarUsuario,
    listarUsuarios,
    listarPorId,
    atualizaUsuarioPorId,
    deletarPorId,
    gerarCarta
};
