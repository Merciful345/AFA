import { createClient } from "@supabase/supabase-js";
import { REGISTRATION_FEE_ARS } from "./prizes";

export type RegistrationStatus = "pending" | "paid" | "rejected" | "cancelled";

export interface Registration {
  id: string;
  full_name: string;
  apodo: string | null;
  dni: string;
  phone: string;
  instagram: string | null;
  email: string;
  status: RegistrationStatus;
  amount: number;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

// Server-only client — nunca se usa en el browser. La tabla `registrations`
// tiene RLS activado sin policies, así que el service role es el único
// camino de lectura/escritura.
//
// El fallback evita que el módulo explote al importarse cuando todavía no
// se cargaron las credenciales reales de Supabase (ej. dev local antes de
// crear el proyecto) — cualquier query real contra el placeholder falla
// limpiamente en el momento de la llamada, no al importar el módulo.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key",
);

export async function getPaidCount(): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid");

  if (error) throw error;
  return count ?? 0;
}

export async function createPendingRegistration(input: {
  full_name: string;
  apodo?: string | null;
  dni: string;
  phone: string;
  instagram?: string | null;
  email: string;
}): Promise<Registration> {
  const { data, error } = await supabaseAdmin
    .from("registrations")
    .insert({
      full_name: input.full_name,
      apodo: input.apodo || null,
      dni: input.dni,
      phone: input.phone,
      instagram: input.instagram || null,
      email: input.email,
      status: "pending",
      amount: REGISTRATION_FEE_ARS,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Registration;
}

export async function attachPreferenceId(registrationId: string, preferenceId: string) {
  const { error } = await supabaseAdmin
    .from("registrations")
    .update({ mp_preference_id: preferenceId })
    .eq("id", registrationId);

  if (error) throw error;
}

export async function markRegistrationCancelled(registrationId: string) {
  await supabaseAdmin
    .from("registrations")
    .update({ status: "cancelled" satisfies RegistrationStatus })
    .eq("id", registrationId);
}

export async function updateRegistrationStatusByPayment(
  externalReference: string,
  status: RegistrationStatus,
  mpPaymentId: string,
) {
  const { error } = await supabaseAdmin
    .from("registrations")
    .update({ status, mp_payment_id: mpPaymentId })
    .eq("id", externalReference);

  if (error) throw error;
}
