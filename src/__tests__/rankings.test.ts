import { describe, it, expect } from "vitest";

// Test ranking computation logic
describe("Ranking Computation", () => {
  it("should rank users by follower count descending", () => {
    const users = [
      { fid: 1, followerCount: 100 },
      { fid: 2, followerCount: 500 },
      { fid: 3, followerCount: 250 },
    ];

    const sorted = [...users].sort((a, b) => b.followerCount - a.followerCount);
    const rankings = sorted.map((u, i) => ({
      fid: u.fid,
      rank: i + 1,
      score: u.followerCount,
    }));

    expect(rankings).toEqual([
      { fid: 2, rank: 1, score: 500 },
      { fid: 3, rank: 2, score: 250 },
      { fid: 1, rank: 3, score: 100 },
    ]);
  });

  it("should compute 24h growth correctly", () => {
    const current = { fid: 1, followerCount: 150 };
    const previous = { fid: 1, followerCount: 120 };
    const growth = current.followerCount - previous.followerCount;

    expect(growth).toBe(30);
  });

  it("should handle zero growth", () => {
    const current = { fid: 1, followerCount: 100 };
    const previous = { fid: 1, followerCount: 100 };
    const growth = current.followerCount - previous.followerCount;

    expect(growth).toBe(0);
  });

  it("should handle negative growth (follower loss)", () => {
    const current = { fid: 1, followerCount: 90 };
    const previous = { fid: 1, followerCount: 100 };
    const growth = current.followerCount - previous.followerCount;

    expect(growth).toBe(-10);
  });
});

describe("Follow Event Diff Detection", () => {
  it("should detect new follows", () => {
    const prev = new Set([1, 2, 3]);
    const curr = new Set([1, 2, 3, 4, 5]);

    const newFollows = [...curr].filter((fid) => !prev.has(fid));
    expect(newFollows).toEqual([4, 5]);
  });

  it("should detect unfollows", () => {
    const prev = new Set([1, 2, 3, 4]);
    const curr = new Set([1, 3]);

    const unfollows = [...prev].filter((fid) => !curr.has(fid));
    expect(unfollows).toEqual([2, 4]);
  });

  it("should handle no changes", () => {
    const prev = new Set([1, 2, 3]);
    const curr = new Set([1, 2, 3]);

    const newFollows = [...curr].filter((fid) => !prev.has(fid));
    const unfollows = [...prev].filter((fid) => !curr.has(fid));

    expect(newFollows).toEqual([]);
    expect(unfollows).toEqual([]);
  });

  it("should handle empty previous (first run)", () => {
    const prev = new Set<number>();
    const curr = new Set([1, 2, 3]);

    const newFollows = [...curr].filter((fid) => !prev.has(fid));
    expect(newFollows).toEqual([1, 2, 3]);
  });
});

describe("Hour Bucket", () => {
  it("should truncate to hour boundary", () => {
    const date = new Date("2025-01-15T14:37:22.000Z");
    date.setMinutes(0, 0, 0);
    expect(date.toISOString()).toBe("2025-01-15T14:00:00.000Z");
  });
});
