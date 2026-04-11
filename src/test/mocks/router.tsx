import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

interface TestWrapperProps {
  children: React.ReactNode;
  initialEntries?: string[];
}

export const TestWrapper = ({ children, initialEntries = ["/"] }: TestWrapperProps) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
