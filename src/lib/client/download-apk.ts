"use client";

export function downloadAppApk(pathOrUrl?: string) {
  if (typeof window === "undefined") return;

  const target = pathOrUrl || "/downloads/durio.apk";
  const fullUrl = target.startsWith("http")
    ? target
    : `${window.location.origin}${target.startsWith("/") ? target : `/${target}`}`;

  const isAndroid = /android/i.test(navigator.userAgent);

  if (isAndroid) {
    const cleanUrl = fullUrl.replace(/^https?:\/\//, "");
    const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end;`;
    window.location.href = intentUrl;
    return;
  }

  const link = document.createElement("a");
  link.href = fullUrl;
  link.download = "durio.apk";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
