// src/global.d.ts

/// <reference types="@solidjs/start/env" />
import { type User } from "@supabase/supabase-js";

declare module "@solidjs/start/server" {
  interface RequestEventLocals {
    user: User | null;
  }
}

