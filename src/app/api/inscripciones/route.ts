import { createPendingRegistration, attachPreferenceId, markRegistrationCancelled } from "@/lib/supabase";
import { createRegistrationPreference } from "@/lib/mercadopago";

function clean(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  const full_name = clean(body.full_name, 120);
  const phone = clean(body.phone, 40);
  const instagram = clean(body.instagram, 60);
  const email = clean(body.email, 160);

  if (!full_name || !phone) {
    return Response.json({ error: "Nombre completo y WhatsApp son obligatorios" }, { status: 400 });
  }

  let registration;
  try {
    registration = await createPendingRegistration({
      full_name,
      phone,
      instagram: instagram || null,
      email: email || null,
    });
  } catch (err) {
    console.error("No se pudo guardar la inscripción", err);
    return Response.json({ error: "No se pudo guardar tu inscripción. Probá de nuevo." }, { status: 500 });
  }

  try {
    const preference = await createRegistrationPreference(registration.id);
    await attachPreferenceId(registration.id, preference.id);
    return Response.json({ id: registration.id, init_point: preference.init_point }, { status: 201 });
  } catch (err) {
    await markRegistrationCancelled(registration.id);
    console.error("No se pudo crear la preferencia de Mercado Pago", err);
    return Response.json({ error: "No se pudo iniciar el pago. Probá de nuevo." }, { status: 500 });
  }
}
