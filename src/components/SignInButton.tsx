"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/context";
import { useCallback } from "react";

export default function SignInButton() {
  const t = useTranslations("auth");
  const { user, signIn, signOut } = useAuth();

  const handleSignIn = useCallback(() => {
    // Open Neynar SIWF popup
    // The SIWF flow uses Neynar's hosted sign-in page
    const clientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;
    if (!clientId) {
      alert("NEXT_PUBLIC_NEYNAR_CLIENT_ID is not configured");
      return;
    }

    const redirectUri = `${window.location.origin}/api/auth/callback`;
    const signInUrl = `https://app.neynar.com/login?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    const popup = window.open(signInUrl, "neynar_siwf", "width=600,height=700");

    // Listen for the callback message
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "neynar_siwf_success") {
        signIn(event.data.user);
        popup?.close();
        window.removeEventListener("message", handler);
      }
    };
    window.addEventListener("message", handler);
  }, [signIn]);

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.pfpUrl && (
          <img src={user.pfpUrl} alt="" className="h-6 w-6 rounded-full" />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          @{user.username}
        </span>
        <button
          onClick={signOut}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          {t("signOut")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="rounded-md bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
    >
      {t("connectWarpcast")}
    </button>
  );
}
