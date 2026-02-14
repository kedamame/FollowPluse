"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface UserActivity {
  user: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string | null;
    follower_count: number;
    following_count: number;
  };
  metrics: {
    ts_hour: string;
    follower_count: number;
    following_count: number;
  }[];
  events: {
    source_fid: number;
    target_fid: number;
    action: "follow" | "unfollow";
    detected_at: string;
  }[];
}

interface Props {
  fid: number;
  onClose: () => void;
}

export default function UserDetailDrawer({ fid, onClose }: Props) {
  const t = useTranslations();
  const [data, setData] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${fid}/activity`);
        if (res.ok) {
          setData(await res.json());
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fid]);

  // Calculate growth from metrics
  const growth24h =
    data && data.metrics.length >= 2
      ? data.metrics[data.metrics.length - 1].follower_count -
        data.metrics[0].follower_count
      : null;

  const warpcastUrl = data?.user?.username
    ? `https://warpcast.com/${data.user.username}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("detail.title")}</h2>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {t("detail.close")}
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-400">
            {t("common.loading")}
          </div>
        ) : !data ? (
          <div className="py-10 text-center text-gray-400">
            {t("common.error")}
          </div>
        ) : (
          <>
            {/* User info */}
            <div className="mb-6 flex items-center gap-4">
              {data.user.pfp_url && (
                <img
                  src={data.user.pfp_url}
                  alt=""
                  className="h-14 w-14 rounded-full"
                />
              )}
              <div>
                <div className="text-lg font-medium">
                  {data.user.display_name || data.user.username}
                </div>
                <div className="text-sm text-gray-400">
                  @{data.user.username}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              <StatCard
                label={t("rankings.followers")}
                value={data.user.follower_count.toLocaleString()}
              />
              <StatCard
                label={t("rankings.growth")}
                value={
                  growth24h !== null
                    ? `${growth24h >= 0 ? "+" : ""}${growth24h.toLocaleString()}`
                    : "—"
                }
                color={
                  growth24h !== null && growth24h > 0
                    ? "green"
                    : growth24h !== null && growth24h < 0
                    ? "red"
                    : undefined
                }
              />
              <StatCard
                label="Following"
                value={data.user.following_count.toLocaleString()}
              />
            </div>

            {/* Profile links - Warpcast */}
            {warpcastUrl && (
              <div className="mb-6 flex flex-col gap-2">
                <a
                  href={warpcastUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 5.5L5.5 2H18.5L22 5.5V18.5L18.5 22H5.5L2 18.5V5.5ZM12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7Z"/>
                  </svg>
                  {t("detail.followOnWarpcast")}
                </a>
                <a
                  href={warpcastUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {t("detail.viewProfile")}
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* Follower history (simple text list) */}
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t("detail.followerHistory")}
            </h3>
            {data.metrics.length > 0 ? (
              <div className="mb-6 max-h-40 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-800">
                <table className="w-full text-xs">
                  <tbody>
                    {data.metrics
                      .slice()
                      .reverse()
                      .slice(0, 20)
                      .map((m, i) => (
                        <tr
                          key={i}
                          className="border-t border-gray-100 dark:border-gray-800"
                        >
                          <td className="px-3 py-1 text-gray-500">
                            {new Date(m.ts_hour).toLocaleString()}
                          </td>
                          <td className="px-3 py-1 text-right font-mono">
                            {m.follower_count.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mb-6 text-sm text-gray-400">
                {t("common.noData")}
              </p>
            )}

            {/* Recent events */}
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t("detail.recentEvents")}
            </h3>
            {data.events.length > 0 ? (
              <div className="space-y-2">
                {data.events.slice(0, 20).map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md border border-gray-100 p-2 text-xs dark:border-gray-800"
                  >
                    <span>
                      <span className="font-mono text-gray-500">
                        FID {ev.source_fid}
                      </span>{" "}
                      <span
                        className={
                          ev.action === "follow"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {ev.action === "follow"
                          ? t("detail.followed")
                          : t("detail.unfollowed")}
                      </span>
                    </span>
                    <span className="text-gray-400">
                      {new Date(ev.detected_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">{t("detail.noEvents")}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: "green" | "red";
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-800">
      <div className="text-xs text-gray-500">{label}</div>
      <div
        className={`mt-1 text-lg font-bold ${
          color === "green"
            ? "text-green-600"
            : color === "red"
            ? "text-red-600"
            : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
