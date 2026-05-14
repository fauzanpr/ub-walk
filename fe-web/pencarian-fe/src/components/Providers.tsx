"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

type TProviders = {
    children: ReactNode;
}

const queryClient = new QueryClient();

function Providers({ children }: TProviders) {
  return (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
  )
}

export default Providers