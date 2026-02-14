import { NextRequest } from "next/server";

export function verifyCronSecret(req: NextRequest): boolean {
  const secret = req.nextUrl.searchParams.get("secret");
  return secret === process.env.CRON_SECRET;
}
