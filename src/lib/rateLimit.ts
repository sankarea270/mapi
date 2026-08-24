import { headers } from "next/headers";

const buckets = new Map<string, { count: number; resetAt: number }>();

export async function rateLimited(
  key: string,
  limit = 10,
  windowMs = 60_000
): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const bucketKey = `${ip}:${key}`;
  const now = Date.now();

  const bucket = buckets.get(bucketKey);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}