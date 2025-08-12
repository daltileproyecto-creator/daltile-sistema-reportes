const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarCorreo(destinatario, asunto, mensaje) {
  try {
    await transporter.sendMail({
      from: `"Sistema de Reportes Dal-Tile" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: `<div style="font-family: Arial, sans-serif; font-size: 14px;">${mensaje}</div>`
    });
    console.log(`📧 Correo enviado a ${destinatario}`);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message, error.response);
  }
}

module.exports = enviarCorreo;
