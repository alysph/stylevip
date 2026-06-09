const MP_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MP_ACCESS_TOKEN;

type PreferenceItem = {
  title: string;
  quantity: number;
  unit_price: number;
};

export async function crearPreferencia(
  items: PreferenceItem[],
  nombreCliente: string,
  correoCliente: string
) {
  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        payer: {
          name: nombreCliente,
          email: correoCliente,
        },
        back_urls: {
          success: 'stylevip://pago-exitoso',
          failure: 'stylevip://pago-fallido',
          pending: 'stylevip://pago-pendiente',
        },
        auto_return: 'approved',
      }),
    });

    const data = await response.json();
    return data.init_point;
  } catch (error) {
    console.error('Error creando preferencia:', error);
    return null;
  }
}