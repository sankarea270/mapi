import { NextResponse } from "next/server";
import { removeSession } from "@/lib/auth";

export async function POST() {
  await removeSession();
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
}
