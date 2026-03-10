import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { router } from '@backend/_core/presentation/orpc-server/router';
import type { RouterClient } from '@orpc/server';

export type AppRouter = typeof router;

export const orpc: RouterClient<typeof router> = createORPCClient(
  new RPCLink({
    url: 'http://localhost:3000/api',
    headers: () => {
      const token = localStorage.getItem('token');
      return {
        ...(token && { Authorization: `Bearer ${token}` }),
      };
    },
  })
);
