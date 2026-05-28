"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

import { Provider as JotaiProvider } from 'jotai'
import { Toaster } from "react-hot-toast";

type TProviders = {
  children: ReactNode;
}

const queryClient = new QueryClient();

function Providers({ children }: TProviders) {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        {children}

        <Toaster />
      </JotaiProvider>
    </QueryClientProvider>
  )
}

export default Providers