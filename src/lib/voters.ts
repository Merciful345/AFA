import crypto from "node:crypto";
import { supabaseAdmin } from "./supabase";

export interface Voter {
  id: string;
  name: string;
  email: string;
  ip_address: string | null;
  points: number;
  password_hash: string;
  created_at: string;
}

const MAX_VOTERS_PER_IP = 2;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const hash = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hashHex, "hex");
  return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
}

export async function findVoterByEmail(email: string): Promise<Voter | null> {
  const { data, error } = await supabaseAdmin
    .from("voters")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function findVoterById(id: string): Promise<Voter | null> {
  const { data, error } = await supabaseAdmin.from("voters").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function countVotersByIp(ip: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("voters")
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip);
  if (error) throw error;
  return count ?? 0;
}

export class VoterLimitError extends Error {}

export async function createVoter(input: {
  name: string;
  email: string;
  password: string;
  ip: string | null;
}): Promise<Voter> {
  if (input.ip) {
    const existing = await countVotersByIp(input.ip);
    if (existing >= MAX_VOTERS_PER_IP) {
      throw new VoterLimitError("Ya se crearon el máximo de cuentas permitidas desde esta conexión");
    }
  }

  const { data, error } = await supabaseAdmin
    .from("voters")
    .insert({
      name: input.name,
      email: normalizeEmail(input.email),
      ip_address: input.ip,
      password_hash: hashPassword(input.password),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLeaderboard(limit = 50): Promise<Pick<Voter, "name" | "points">[]> {
  const { data, error } = await supabaseAdmin
    .from("voters")
    .select("name, points")
    .order("points", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export function clientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}
