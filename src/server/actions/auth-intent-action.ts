"use server";

import { setAuthIntent } from "@/server/auth-intent";

export async function setLoginIntent() {
  await setAuthIntent("login");
}

export async function setRegisterIntent() {
  await setAuthIntent("register");
}
