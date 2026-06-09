const RESEND_API_KEY = process.env.EXPO_PUBLIC_RESEND_API_KEY;
const FROM_EMAIL = 'StyleVIP <onboarding@resend.dev>';

type EmailConfirmacion = {
  nombre: string;
  correo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  servicios: string[];
  total: number;
  metodoPago: string;
  reservaId: string;
};

export async function enviarConfirmacion(datos: EmailConfirmacion) {
  const { nombre, correo, fecha, horaInicio, horaFin, servicios, total, metodoPago, reservaId } = datos;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1A1A2E; color: #FFFFFF; padding: 32px; border-radius: 12px;">
      <h1 style="color: #C9A84C; text-align: center;">✂️ StyleVIP</h1>
      <h2 style="color: #FFFFFF; text-align: center;">¡Reserva confirmada!</h2>
      
      <div style="background-color: #252540; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #AAAAAA; margin: 0 0 8px;">Hola <strong style="color: #FFFFFF;">${nombre}</strong>,</p>
        <p style="color: #AAAAAA;">Tu cita en StyleVIP ha sido confirmada con los siguientes detalles:</p>
        
        <hr style="border-color: #333355; margin: 16px 0;" />
        
        <table style="width: 100%;">
          <tr>
            <td style="color: #AAAAAA; padding: 6px 0;">📅 Fecha</td>
            <td style="color: #FFFFFF; text-align: right;">${fecha}</td>
          </tr>
          <tr>
            <td style="color: #AAAAAA; padding: 6px 0;">🕐 Hora</td>
            <td style="color: #FFFFFF; text-align: right;">${horaInicio} — ${horaFin}</td>
          </tr>
          <tr>
            <td style="color: #AAAAAA; padding: 6px 0;">✂️ Servicios</td>
            <td style="color: #FFFFFF; text-align: right;">${servicios.join(', ')}</td>
          </tr>
          <tr>
            <td style="color: #AAAAAA; padding: 6px 0;">💳 Pago</td>
            <td style="color: #FFFFFF; text-align: right;">${metodoPago === 'online' ? 'Pagado online' : 'Efectivo en el local'}</td>
          </tr>
          <tr>
            <td style="color: #AAAAAA; padding: 6px 0;">💰 Total</td>
            <td style="color: #C9A84C; text-align: right; font-weight: bold;">$${total.toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #AAAAAA; text-align: center; font-size: 13px;">
        ¿Necesitas cancelar tu cita?
      </p>
      <a href="https://stylevip.app/cancelar/${reservaId}"
         style="display: block; background-color: #3A1A1A; color: #F44336; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
        ❌ Cancelar mi reserva
      </a>
      <p style="color: #C9A84C; text-align: center; font-weight: bold;">¡Te esperamos!</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: correo,
        subject: '✂️ StyleVIP — Tu reserva está confirmada',
        html,
      }),
    });

    const data = await response.json();
    console.log('Email enviado:', data);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
}

export async function enviarRecordatorio(datos: Omit<EmailConfirmacion, 'metodoPago' | 'total'>) {
  const { nombre, correo, fecha, horaInicio, servicios } = datos;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1A1A2E; color: #FFFFFF; padding: 32px; border-radius: 12px;">
      <h1 style="color: #C9A84C; text-align: center;">✂️ StyleVIP</h1>
      <h2 style="color: #FFFFFF; text-align: center;">⏰ Recordatorio de tu cita</h2>
      
      <div style="background-color: #252540; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #AAAAAA;">Hola <strong style="color: #FFFFFF;">${nombre}</strong>,</p>
        <p style="color: #AAAAAA;">Te recordamos que tienes una cita en <strong style="color: #C9A84C;">StyleVIP</strong> próximamente:</p>
        
        <hr style="border-color: #333355; margin: 16px 0;" />
        
        <table style="width: 100%;">
          <tr>
            <td style="color: #AAAAAA; padding: 6px 0;">📅 Fecha</td>
            <td style="color: #FFFFFF; text-align: right;">${fecha}</td>
          </tr>
          <tr>
            <td style="color: #AAAAAA; padding: 6px 0;">🕐 Hora</td>
            <td style="color: #FFFFFF; text-align: right;">${horaInicio}</td>
          </tr>
          <tr>
            <td style="color: #AAAAAA; padding: 6px 0;">✂️ Servicios</td>
            <td style="color: #FFFFFF; text-align: right;">${servicios.join(', ')}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #C9A84C; text-align: center; font-weight: bold;">¡Te esperamos!</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: correo,
        subject: '⏰ StyleVIP — Recordatorio de tu cita',
        html,
      }),
    });

    const data = await response.json();
    console.log('Recordatorio enviado:', data);
    return true;
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    return false;
  }
}