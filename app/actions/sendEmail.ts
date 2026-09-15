"use server";

import nodemailer from "nodemailer";

export async function sendEmail(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !phone || !message) {
    return { success: false, error: "Todos los campos son obligatorios." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.contexsas.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "notificaciones@contexsas.com",
        pass: process.env.SMTP_PASS, // La contraseña debe venir del .env.local
      },
      tls: {
        rejectUnauthorized: false // Puede ser necesario para servidores de correo corporativos
      }
    });

    // Enviar el correo a la cuenta de pruebas/destino
    await transporter.sendMail({
      from: `"Contex SAS Web" <${process.env.SMTP_USER || "notificaciones@contexsas.com"}>`,
      to: process.env.SMTP_TO || "auxsistemas@contexsas.com", // Lee la variable SMTP_TO (pueden ser varios separados por coma)
      subject: `Nuevo mensaje de contacto de: ${name}`,
      text: `Nombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone}\nMensaje:\n${message}`,
      html: `
        <h2>Nuevo mensaje de contacto desde la página web</h2>
        <p><strong>Nombre / Empresa:</strong> ${name}</p>
        <p><strong>Correo Electrónico:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error enviando el correo:", error);
    return { success: false, error: "Hubo un error al enviar el mensaje. Intenta de nuevo más tarde." };
  }
}
