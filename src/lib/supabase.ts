import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

/** Phone OTP: pass Nigeria's E.164 phone number, e.g. +2348012345678. */
export async function sendPhoneOtp(phone: string) {
  if (!supabase) throw new Error("Supabase environment variables are missing.");
  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyPhoneOtp(phone: string, token: string) {
  if (!supabase) throw new Error("Supabase environment variables are missing.");
  return supabase.auth.verifyOtp({ phone, token, type: "sms" });
}