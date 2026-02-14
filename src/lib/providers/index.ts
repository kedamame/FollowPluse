import type { FarcasterProvider } from "./types";
import { NeynarProvider } from "./neynar";

export type { FarcasterProvider, FarcasterUser, FollowerEdge } from "./types";

let providerInstance: FarcasterProvider | null = null;

export function getProvider(): FarcasterProvider {
  if (!providerInstance) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error("NEYNAR_API_KEY environment variable is required");
    }
    providerInstance = new NeynarProvider(apiKey);
  }
  return providerInstance;
}
