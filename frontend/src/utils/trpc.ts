import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../fakeServer/router';

export const trpc = createTRPCReact<AppRouter>();
