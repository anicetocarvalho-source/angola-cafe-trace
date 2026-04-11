import { vi } from "vitest";

// Reusable mock builders
export const createMockUser = (overrides = {}) => ({
  id: "test-user-id",
  email: "test@example.com",
  ...overrides,
});

export const createMockSession = (user = createMockUser()) => ({
  user,
  access_token: "mock-token",
  refresh_token: "mock-refresh",
});

export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        data: [],
        error: null,
      }),
      data: [],
      error: null,
      order: vi.fn().mockReturnValue({ data: [], error: null }),
      limit: vi.fn().mockReturnValue({ data: [], error: null }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: "new-id" }, error: null }),
        data: [{ id: "new-id" }],
        error: null,
      }),
      data: [{ id: "new-id" }],
      error: null,
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  });

  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  };

  return { from: mockFrom, auth: mockAuth };
};

// Default mock — import in tests and override as needed
export const mockSupabase = createMockSupabaseClient();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));
