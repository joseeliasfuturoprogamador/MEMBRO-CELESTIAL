const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');

/**
 * Gera o PDF da carta a partir do usuário e igreja
 * @param {Object} usuario - documento do usuário (membro)
 * @param {Object} igreja - documento da igreja
 * @returns {Buffer} PDF
 */
async function gerarCartaPDF(usuario, igreja) {
  try {
    // 1. Carregar template
    const templatePath = path.join(__dirname, '../geradordecarta/carta.handlebars');
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateHtml);

    // 2. Converter logos para Base64
    const logoBase64 = igreja.logoConvencao
      ? fs.readFileSync(path.resolve(igreja.logoConvencao), { encoding: 'base64' })
      : '';
    const ceademaBase64 = fs.readFileSync(path.join(__dirname, '../imagens/OIP.jpg'), { encoding: 'base64' });

    // 3. Formatar datas
    const batismo = usuario.batismo
      ? new Date(usuario.batismo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      : '';
    const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    // 4. Preparar dados para o template
    const data = {
      nome: usuario.nome,
      batismo,
      dataAtual,
      endereco: igreja.endereco || '',
      cidade: igreja.cidade || '',
      uf: igreja.uf || '',
      pastorPresidente: igreja.pastorPresidente || '',
      logoBase64: logoBase64 ? `data:image/png;base64,${logoBase64}` : '',
      ceademaBase64: `data:image/jpg;base64,${ceademaBase64}`,
    };

    // 5. Renderizar HTML
    const html = template(data);

    // 6. Gerar PDF com Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return pdfBuffer;

  } catch (error) {
    console.error("Erro ao gerar carta PDF:", error);
    throw error;
  }
}

module.exports = { gerarCartaPDF };
