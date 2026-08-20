import { getPayment, verifyWebhookSignature, InvalidWebhookSignatureError } from "@/lib/mercadopago";
import { updateRegistrationStatusByPayment, type RegistrationStatus } from "@/lib/supabase";

function mapPaymentStatus(mpStatus: string | undefined): RegistrationStatus | null {
  switch (mpStatus) {
    case "approved":
      return "paid";
    case "rejected":
      return "rejected";
    case "cancelled":
    case "refunded":
    case "charged_back":
      return "cancelled";
    default:
      // pending / in_process / in_mediation: no tocamos el estado todavía
      return null;
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const dataId = url.searchParams.get("data.id");

  const signatureCheck = () =>
    verifyWebhookSignature({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
    });

  try {
    signatureCheck();
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      console.warn("Firma de webhook de Mercado Pago inválida", err.reason);
      return new Response("Invalid signature", { status: 401 });
    }
    throw err;
  }

  if (type !== "payment" || !dataId) {
    return new Response("OK", { status: 200 });
  }

  // Los simuladores de notificaciones (y algunos reintentos de MP) mandan
  // ids de pago que no existen de verdad — no dejamos que eso tire un 500,
  // solo lo logueamos y respondemos OK igual.
  try {
    const payment = await getPayment(dataId);
    const status = mapPaymentStatus(payment.status);

    if (status && payment.external_reference) {
      await updateRegistrationStatusByPayment(payment.external_reference, status, String(payment.id));
    }
  } catch (err) {
    console.error("No se pudo procesar la notificación de pago", dataId, err);
  }

  return new Response("OK", { status: 200 });
}
