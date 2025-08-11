/// <reference types="@solidjs/start/env" />
import { type User } from "@supabase/supabase-js";

declare module "@solidjs/start/server" {
  interface RequestEventLocals {
    // Qui dichiariamo che `event.locals` avrà una proprietà `user`
    // che può essere un oggetto User di Supabase o null.
    user: User | null;
  }
}