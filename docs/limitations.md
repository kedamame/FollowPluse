# FollowPulse Limitations (Free Tier)

## Neynar API Constraints

### Rate Limits
- **Free plan: ~300 requests/day**
- Ingestion uses ~204 requests/day (4 runs × 51 requests)
- Remaining ~96 requests/day for user-initiated actions

### Follow Event Detection
- Only the **most recent 100 followers** per user are fetched each cycle
- **Unfollow detection is limited**: if a user unfollows and was not in the last 100 followers snapshot, the unfollow may not be detected
- **New follow detection**: reliable for accounts gaining < 100 new followers per 6-hour window
- High-growth accounts (100+ new followers in 6 hours) may miss some follow events

### Top 50 Universe
- Rankings are based on the **top 50 users retrievable from Neynar's API**
- This is not the full Farcaster user base
- Users outside the top 50 are not tracked
- Future improvement: expand via Snapchain direct access or Neynar paid plan

## Supabase Free Tier Constraints

### Storage
- 500 MB database storage
- With 50 tracked users, 4 snapshots/day, 7-day retention: estimated < 50 MB

### API Limits
- 50,000 requests/month (Supabase API)
- FollowPulse usage is well within this limit

### Row Limits
- No hard row limit on free tier, but storage is capped
- Automatic retention job (7 days) keeps data manageable

## Update Frequency
- Data refreshes every **6 hours** (not real-time)
- Rankings, metrics, and follow events are snapshots
- Timestamps in the UI reflect the last ingestion time

## Notification Constraints

### In-App Notifications (Farcaster Mini App)
- Notifications are delivered via Farcaster Mini App notification channel
- Requires user to have the Mini App installed
- Threshold-based: triggers when follower change exceeds user-configured threshold within a 6-hour window

### Direct Messages (DM)
- **Not supported**: Farcaster does not provide a public API for sending DMs programmatically
- This is a platform limitation, not a FollowPulse limitation
- If Farcaster opens DM APIs in the future, this can be added

## Authentication
- Follow/Unfollow actions require Sign in with Farcaster (SIWF)
- Neynar Managed Signer is used for signing transactions
- First-time users must approve the signer (one-time Warpcast approval)
- Viewing rankings and data is public (no auth required)

## Future Expansion Points
1. **Snapchain direct access**: bypass Neynar for unlimited data queries
2. **Neynar paid plan**: higher rate limits, more detailed data
3. **Larger N**: track more than 50 users
4. **Higher frequency**: update more often than every 6 hours
5. **Full follower graph**: detect all unfollows, not just recent ones
