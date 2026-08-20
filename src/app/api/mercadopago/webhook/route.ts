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

interface MpWebhookBody {
  type?: string;
  action?: string;
  data?: { id?: string | number };
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const body: MpWebhookBody | null = await request.json().catch(() => null);

  // MP documenta que type/data.id van en la query string, pero en la
  // práctica las notificaciones reales de pago también los mandan en el
  // body — y a veces SOLO ahí. Leemos de los dos lugares para no
  // depender de cuál formato use esta cuenta en particular.
  const type = url.searchParams.get("type") || body?.type || (body?.action?.startsWith("payment") ? "payment" : null);
  const dataId = url.searchParams.get("data.id") || (body?.data?.id != null ? String(body.data.id) : null);

  console.log("Webhook MP recibido", {
    query: Object.fromEntries(url.searchParams),
    body,
    hasSignature: Boolean(request.headers.get("x-signature")),
    resolvedType: type,
    resolvedDataId: dataId,
  });

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
