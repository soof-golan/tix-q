import * as trpc from '@trpc/server';
import {publicProcedure, router} from './trpc';
import {z} from "zod";

const appRouter = router({
  register: publicProcedure.input(z.object({
    email: z.string().email(),
    legalName: z.string(),
    idNumber: z.string(),
    idType: z.enum(['PASSPORT', 'ID_CARD']),
    waitingRoomId: z.string().uuid(),
    phoneNumber: z.string(),
    // TODO: turnstile token
  })).mutation(() => {
    /*
    * id: UUID4
    legalName: str
    email: EmailStr
    phoneNumber: str
    idNumber: str
    idType: enums.IdType
    waitingRoomId: str
    * */
    return {
      id: '123',
      legalName: 'John Doe',
      email: 'example@example.com',
      phoneNumber: '+1234567890',
      idNumber: '1234567890',
      idType: 'PASSPORT',
      waitingRoomId: '123',
    }
  })
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
