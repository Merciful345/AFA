import {
  MercadoPagoConfig,
  Preference,
  Payment,
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from "mercadopago";
import { REGISTRATION_FEE_ARS } from "./prizes";

export { InvalidWebhookSignatureError };

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL!;
}

export async function createRegistrationPreference(registrationId: string) {
  // Mercado Pago exige https en las back_urls para poder usar auto_return
  // (rechaza la preference entera si no). En local (http://localhost) lo
  // omitimos: el pago funciona igual, el usuario solo tiene que tocar
  // "volver al sitio" en vez de que MP lo mande de una.
  const isHttps = siteUrl().startsWith("https://");

  const preference = await new Preference(mpClient).create({
    body: {
      items: [
        {
          id: "inscripcion-afa",
          title: "Inscripción AFA — Torneo de Aura Farming",
          quantity: 1,
          currency_id: "ARS",
          unit_price: REGISTRATION_FEE_ARS,
        },
      ],
      external_reference: registrationId,
      back_urls: {
        success: `${siteUrl()}/inscripcion/exito`,
        pending: `${siteUrl()}/inscripcion/pendiente`,
        failure: `${siteUrl()}/inscripcion/error`,
      },
      ...(isHttps ? { auto_return: "approved" as const } : {}),
      notification_url: `${siteUrl()}/api/mercadopago/webhook`,
    },
  });

  return { id: preference.id!, init_point: preference.init_point! };
}

export async function getPayment(paymentId: string) {
  return new Payment(mpClient).get({ id: paymentId });
}

/** Lanza InvalidWebhookSignatureError si la notificación no vino realmente de Mercado Pago. */
export function verifyWebhookSignature(options: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}) {
  WebhookSignatureValidator.validate({
    xSignature: options.xSignature,
    xRequestId: options.xRequestId,
    dataId: options.dataId,
    secret: process.env.MP_WEBHOOK_SECRET!,
    toleranceSeconds: 300,
  });
}
