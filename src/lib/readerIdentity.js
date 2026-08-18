import { requireSupabase } from "@/api/supabaseClient";

const TOKEN_KEY = "andromeda_reader_token";
const USERNAME_KEY = "andromeda_reader_username";

export function getReaderToken() {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function getSavedUsername() {
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function saveUsername(username) {
  localStorage.setItem(USERNAME_KEY, username.trim());
}

export async function claimReaderUsername(username) {
  const name = username.trim();
  const { data, error } = await requireSupabase().rpc("claim_reader_username", {
    p_token: getReaderToken(),
    p_username: name,
  });
  if (error) throw new Error(error.message.includes("username_taken") ? "username_taken" : error.message);
  saveUsername(data.username);
  return data;
}
