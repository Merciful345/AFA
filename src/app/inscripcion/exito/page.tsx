import { CheckCircle2 } from "lucide-react";
import StatusPage from "@/components/site/StatusPage";
import { getPayment } from "@/lib/mercadopago";
import { updateRegistrationStatusByPayment } from "@/lib/supabase";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string }>;
}) {
  const { payment_id } = await searchParams;

  // Respaldo del webhook: Mercado Pago siempre redirige acá con el
  // payment_id en la URL cuando el pago se aprueba, aunque la
  // notificación server-to-server no llegue (o llegue tarde). Nunca
  // confiamos en el estado que venga por query string — lo volvemos a
  // consultar nosotros mismos contra la API con nuestro propio token.
  if (payment_id) {
    try {
      const payment = await getPayment(payment_id);
      if (payment.status === "approved" && payment.external_reference) {
        await updateRegistrationStatusByPayment(payment.external_reference, "paid", String(payment.id));
      }
    } catch (err) {
      console.error("No se pudo confirmar el pago desde la redirección", payment_id, err);
    }
  }

  return (
    <StatusPage
      icon={CheckCircle2}
      iconClassName="bg-success/10 text-success"
      title="¡Pago recibido!"
      text="Ya quedaste anotado en el bracket de AFA. Te vamos a avisar la fecha y el lugar por Instagram (@afa.tucuman) apenas estén confirmados."
    />
  );
}
