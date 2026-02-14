import type { FarcasterProvider, FarcasterUser, FollowerEdge } from "./types";

// Top Farcaster users by FID (seed list for free tier)
const SEED_FIDS = [
  3, 2, 12142, 5650, 99, 194, 1325, 7143, 239, 576,
  1541, 680, 2433, 4085, 20909, 7637, 4167, 129, 8685, 1048,
  557, 602, 2904, 3621, 1317, 6596, 4482, 7657, 2880, 1356,
  5179, 4873, 7399, 2689, 617, 3642, 266, 1110, 12145, 8,
  15983, 7601, 347, 1688, 2282, 4407, 616, 5094, 6023, 4823,
];

const NEYNAR_BASE = "https://api.neynar.com/v2/farcaster";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(u: any): FarcasterUser {
  return {
    fid: u.fid,
    username: u.username ?? "",
    displayName: u.display_name ?? "",
    pfpUrl: u.pfp_url ?? null,
    followerCount: u.follower_count ?? 0,
    followingCount: u.following_count ?? 0,
  };
}

async function neynarGet(apiKey: string, path: string): Promise<unknown> {
  const res = await fetch(`${NEYNAR_BASE}${path}`, {
    headers: { "x-api-key": apiKey },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Neynar ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export class NeynarProvider implements FarcasterProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getTopUsers(limit: number): Promise<FarcasterUser[]> {
    const users = await this.getUsersByFids(SEED_FIDS);
    users.sort((a, b) => b.followerCount - a.followerCount);
    return users.slice(0, limit);
  }

  async getFollowers(fid: number, limit: number = 100): Promise<FollowerEdge[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await neynarGet(
      this.apiKey,
      `/followers?fid=${fid}&limit=${Math.min(limit, 100)}`
    );
    const users = data.result?.users ?? data.users ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return users.map((item: any) => ({
      sourceFid: item.user?.fid ?? item.fid,
      targetFid: fid,
    }));
  }

  async followUser(signerUuid: string, targetFid: number): Promise<void> {
    const res = await fetch(`${NEYNAR_BASE}/user/follow`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ signer_uuid: signerUuid, target_fids: [targetFid] }),
    });
    if (!res.ok) throw new Error(`Follow failed: ${res.status}`);
  }

  async unfollowUser(signerUuid: string, targetFid: number): Promise<void> {
    const res = await fetch(`${NEYNAR_BASE}/user/follow`, {
      method: "DELETE",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ signer_uuid: signerUuid, target_fids: [targetFid] }),
    });
    if (!res.ok) throw new Error(`Unfollow failed: ${res.status}`);
  }

  async getUserByFid(fid: number): Promise<FarcasterUser | null> {
    const users = await this.getUsersByFids([fid]);
    return users[0] ?? null;
  }

  async getUsersByFids(fids: number[]): Promise<FarcasterUser[]> {
    if (fids.length === 0) return [];
    const fidsStr = fids.join(",");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await neynarGet(this.apiKey, `/user/bulk?fids=${fidsStr}`);
    return (data.users ?? []).map(mapUser);
  }
}
