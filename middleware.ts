import { createClient } from "./utils/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request)

  try {
    await supabase.auth.getSession()
  } catch {
    // Continue even if session refresh is unavailable.
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
