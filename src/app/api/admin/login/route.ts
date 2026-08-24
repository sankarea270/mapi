import { NextResponse } from "next/server";
import { validateAdminCredentials, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { user, pass } = body ?? {};

  if (!user || !pass) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const valid = await validateAdminCredentials(String(user), String(pass));
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
