import { createPendingRegistration, attachPreferenceId, markRegistrationCancelled, getSettings } from "@/lib/supabase";
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
  const apodo = clean(body.apodo, 60);
  const dni = clean(body.dni, 20);
  const phone = clean(body.phone, 40);
  const instagram = clean(body.instagram, 60);
  const email = clean(body.email, 160);

  if (!full_name || !dni || !phone || !email) {
    return Response.json(
      { error: "Nombre completo, DNI, WhatsApp y email son obligatorios" },
      { status: 400 },
    );
  }

  // Sin try/catch acá a propósito: si no podemos leer el precio actual, es
  // preferible que la inscripción falle entera a que cobre un monto viejo
  // o incorrecto.
  const { registration_fee: amount } = await getSettings();

  let registration;
  try {
    registration = await createPendingRegistration({
      full_name,
      apodo: apodo || null,
      dni,
      phone,
      instagram: instagram || null,
      email,
      amount,
    });
  } catch (err) {
    console.error("No se pudo guardar la inscripción", err);
    return Response.json({ error: "No se pudo guardar tu inscripción. Probá de nuevo." }, { status: 500 });
  }

  try {
    const preference = await createRegistrationPreference(registration.id, amount);
    await attachPreferenceId(registration.id, preference.id);
    return Response.json({ id: registration.id, init_point: preference.init_point }, { status: 201 });
  } catch (err) {
    await markRegistrationCancelled(registration.id);
    console.error("No se pudo crear la preferencia de Mercado Pago", err);
    return Response.json({ error: "No se pudo iniciar el pago. Probá de nuevo." }, { status: 500 });
  }
}
