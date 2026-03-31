import { NextResponse } from "next/server"

// Progress is currently managed client-side
// This route is a placeholder for when we add persistent auth
export async function POST() {
  return NextResponse.json({ newlyAvailable: [] })
}
