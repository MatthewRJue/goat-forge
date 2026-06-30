import { afterEach, describe, expect, it } from "vitest";

import { createSupabaseClient } from "@/lib/supabase/client";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
});

describe("createSupabaseClient", () => {
  it("fails clearly when Supabase environment variables are missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => createSupabaseClient()).toThrow(
      "Missing Supabase environment variables.",
    );
  });
});
