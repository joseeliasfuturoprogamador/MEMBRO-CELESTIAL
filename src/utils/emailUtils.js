const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envia um código por e-mail estilizado.
 * @param {string} email - E-mail de destino
 * @param {string} codigo - Código a ser enviado
 * @param {string} assunto - Assunto do e-mail
 */
const enviarCodigoEmail = async (email, codigo, assunto) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: assunto,
    html: `
      <div style="background-color:#f0f2f5;padding:40px 20px;font-family:Helvetica,Arial,sans-serif;">
        <div style="max-width:600px;margin:auto;background-color:#fff;padding:30px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <h1 style="color:#1877f2;text-align:center;margin-bottom:20px;">Membro Celestial</h1>
          <p style="font-size:16px;color:#333;">Olá,</p>
          <p style="font-size:16px;color:#333;">
            Aqui está seu <strong>código ${assunto.toLowerCase().includes('senha') ? 'para redefinir sua senha' : 'de confirmação de cadastro'}:</strong>
          </p>
          <div style="text-align:center;margin:30px 0;">
            <span style="display:inline-block;background-color:#1877f2;color:#fff;font-size:28px;font-weight:bold;padding:15px 30px;border-radius:8px;letter-spacing:2px;">
              ${codigo}
            </span>
          </div>
          <p style="font-size:14px;color:#555;">
            Se você não solicitou este código, pode ignorar este e-mail com segurança.
          </p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #ddd;" />
          <p style="font-size:12px;color:#999;text-align:center;">
            © ${new Date().getFullYear()} Membro Celestial · Todos os direitos reservados
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  enviarCodigoEmail,
};
