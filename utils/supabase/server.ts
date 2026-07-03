import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map((cookie) => {
          const c: any = cookie
          return {
            name: c.name,
            value: c.value,
            options: {
              path: c.path,
              domain: c.domain,
              expires: c.expires,
              httpOnly: c.httpOnly,
              maxAge: c.maxAge,
              sameSite: c.sameSite,
              secure: c.secure,
            },
          }
        })
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // Some server contexts cannot mutate cookies; ignore.
          }
        })
      },
    },
  })
}
