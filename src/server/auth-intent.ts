import { cookies } from "next/headers";

const AUTH_INTENT_COOKIE = "auth_intent";

export type AuthIntent = "login" | "register";

export async function setAuthIntent(intent: AuthIntent) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_INTENT_COOKIE, intent, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 5, // 5 minutes
  });
}

export async function getAuthIntent(): Promise<AuthIntent | undefined> {
  const cookieStore = await cookies();
  const intent = cookieStore.get(AUTH_INTENT_COOKIE)?.value;
  return intent as AuthIntent | undefined;
}

export async function clearAuthIntent() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_INTENT_COOKIE);
}
