import { createClient } from "@supabase/supabase-js";

// Cliente para el browser — usa la anon key pública, no el service role.
// RLS sigue activado sin policies en todas las tablas, así que esta clave
// sola no habilita leer ni escribir nada; solo sirve para subir un archivo
// a Storage usando el token firmado de un solo uso que nos da el servidor.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
