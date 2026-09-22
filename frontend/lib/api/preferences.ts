import type { AvoidReason, TasteProfile } from "../types";
import { apiFetch } from "./client";

// My Taste (Favs + Avoid list). Every call returns the full saved profile.

type ProfileResponse = { profile: TasteProfile };

export async function getTasteProfile() {
  return (await apiFetch<ProfileResponse>("/api/preferences")).profile;
}

export async function addFavorite(name: string) {
  return (await apiFetch<ProfileResponse>("/api/preferences/favorite", { body: { name } })).profile;
}

export async function removeFavorite(name: string) {
  return (await apiFetch<ProfileResponse>("/api/preferences/favorite", { method: "DELETE", body: { name } })).profile;
}

export async function addDislike(name: string, reason?: AvoidReason) {
  return (await apiFetch<ProfileResponse>("/api/preferences/dislike", { body: { name, reason } })).profile;
}

export async function removeDislike(name: string) {
  return (await apiFetch<ProfileResponse>("/api/preferences/dislike", { method: "DELETE", body: { name } })).profile;
}
