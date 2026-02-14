"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import UserDetailDrawer from "./UserDetailDrawer";

type MetricKey = "follower_count" | "24h_growth" | "6h_growth";

interface RankingUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string | null;
  follower_count: number;
  following_count: number;
}

interface RankingRow {
  rank: number;
  score: number;
  user: RankingUser | null;
}

interface RankingResponse {
  data: RankingRow[];
  total: number;
  page: number;
  metric: string;
  ts_hour: string | null;
}

export default function RankingTable() {
  const t = useTranslations();
  const [metric, setMetric] = useState<MetricKey>("24h_growth");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFid, setSelectedFid] = useState<number | null>(null);

  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/rankings?metric=${metric}&page=${page}&limit=${limit}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: RankingResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [metric, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const metrics: { key: MetricKey; label: string }[] = [
    { key: "24h_growth", label: t("rankings.metric.24h_growth") },
    { key: "6h_growth", label: t("rankings.metric.6h_growth") },
    { key: "follower_count", label: t("rankings.metric.follower_count") },
  ];

  return (
    <div>
      {/* Metric selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="self-center text-sm text-gray-500">
          {t("rankings.metric.label")}:
        </span>
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setMetric(m.key);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              metric === m.key
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Last updated */}
      {data?.ts_hour && (
        <p className="mb-3 text-xs text-gray-400">
          {t("common.lastUpdated")}:{" "}
          {new Date(data.ts_hour).toLocaleString()}
        </p>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          {t("common.loading")}
        </div>
      ) : error ? (
        <div className="py-20 text-center text-red-500">
          {t("common.error")}: {error}
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          {t("common.noData")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900">
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
                  {t("rankings.rank")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
                  {t("rankings.user")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
                  {t("rankings.followers")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
                  {t("rankings.score")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">
                  {t("rankings.details")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((row) => (
                <tr
                  key={row.user?.fid ?? row.rank}
                  className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                >
                  <td className="px-4 py-3 font-mono text-gray-500">
                    #{row.rank}
                  </td>
                  <td className="px-4 py-3">
                    {row.user ? (
                      <div className="flex items-center gap-3">
                        {row.user.pfp_url && (
                          <a
                            href={`https://warpcast.com/${row.user.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={row.user.pfp_url}
                              alt=""
                              className="h-8 w-8 rounded-full hover:ring-2 hover:ring-purple-400 transition-all"
                            />
                          </a>
                        )}
                        <div>
                          <a
                            href={`https://warpcast.com/${row.user.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-900 hover:text-purple-600 dark:text-gray-100 dark:hover:text-purple-400 transition-colors"
                          >
                            {row.user.display_name || row.user.username}
                          </a>
                          <div className="text-xs text-gray-400">
                            @{row.user.username}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                    {row.user?.follower_count?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ScoreBadge metric={metric} score={row.score} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.user && (
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={`https://warpcast.com/${row.user.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t("detail.openWarpcast")}
                          className="rounded-md bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-700 transition-colors"
                        >
                          Warpcast
                        </a>
                        <button
                          onClick={() => setSelectedFid(row.user!.fid)}
                          className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                          {t("rankings.details")}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-gray-700"
          >
            {t("rankings.prev")}
          </button>
          <span className="text-sm text-gray-500">
            {t("rankings.page")} {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-40 dark:border-gray-700"
          >
            {t("rankings.next")}
          </button>
        </div>
      )}

      {/* Detail drawer */}
      {selectedFid !== null && (
        <UserDetailDrawer
          fid={selectedFid}
          onClose={() => setSelectedFid(null)}
        />
      )}
    </div>
  );
}

function ScoreBadge({ metric, score }: { metric: MetricKey; score: number }) {
  if (metric === "follower_count") {
    return (
      <span className="text-gray-700 dark:text-gray-300">
        {score.toLocaleString()}
      </span>
    );
  }
  const isPositive = score > 0;
  const isNegative = score < 0;
  return (
    <span
      className={
        isPositive
          ? "font-medium text-green-600"
          : isNegative
          ? "font-medium text-red-600"
          : "text-gray-400"
      }
    >
      {isPositive ? "+" : ""}
      {score.toLocaleString()}
    </span>
  );
}
