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

// Deep chainable mock for supabase query builder
const createChainableMock = (resolvedData: any = { data: [], error: null }) => {
  const chain: any = {};
  const methods = ["select", "insert", "update", "delete", "eq", "neq", "gt", "lt", "gte", "lte", "order", "limit", "single", "maybeSingle", "in", "is", "not", "filter", "match", "range", "textSearch", "or", "and"];
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  // Terminal values
  chain.data = resolvedData.data;
  chain.error = resolvedData.error;
  chain.count = resolvedData.count ?? null;
  // Make it thenable for await
  chain.then = (resolve: any) => resolve(resolvedData);
  return chain;
};

const mockChannel = vi.fn().mockReturnValue({
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  unsubscribe: vi.fn(),
});

export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn().mockReturnValue(createChainableMock());

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

  return { from: mockFrom, auth: mockAuth, channel: mockChannel, removeChannel: vi.fn() };
};

// Default mock
export const mockSupabase = createMockSupabaseClient();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));
