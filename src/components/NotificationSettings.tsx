"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/context";

export default function NotificationSettings() {
  const t = useTranslations("notifications");
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState(20);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/notifications/subscribe?fid=${user.fid}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.subscription) {
          setEnabled(data.subscription.enabled);
          setThreshold(data.subscription.threshold_followers);
        }
      });
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setSaved(false);
    try {
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid: user.fid,
          enabled,
          threshold_followers: threshold,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }, [user, enabled, threshold]);

  if (!user) return null;

  return (
    <div className="mt-8 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="mb-4 text-lg font-semibold">{t("title")}</h3>

      <label className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded accent-purple-600"
        />
        <span className="text-sm">{t("enabled")}</span>
      </label>

      <label className="mb-4 block">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t("threshold")}
        </span>
        <input
          type="number"
          min={1}
          max={1000}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <button
        onClick={handleSave}
        disabled={loading}
        className="rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "..." : saved ? t("saved") : t("save")}
      </button>
    </div>
  );
}
