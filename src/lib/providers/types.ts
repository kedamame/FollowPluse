export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string | null;
  followerCount: number;
  followingCount: number;
}

export interface FollowerEdge {
  sourceFid: number;
  targetFid: number;
}

export interface FarcasterProvider {
  /** Get top N users by follower count */
  getTopUsers(limit: number): Promise<FarcasterUser[]>;

  /** Get recent followers of a user (up to 100) */
  getFollowers(fid: number, limit?: number): Promise<FollowerEdge[]>;

  /** Follow a user (requires signer) */
  followUser(signerUuid: string, targetFid: number): Promise<void>;

  /** Unfollow a user (requires signer) */
  unfollowUser(signerUuid: string, targetFid: number): Promise<void>;

  /** Get user by FID */
  getUserByFid(fid: number): Promise<FarcasterUser | null>;

  /** Get multiple users by FIDs */
  getUsersByFids(fids: number[]): Promise<FarcasterUser[]>;
}
