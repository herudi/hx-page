import type { Handlers } from "../deps.ts";

export type Wares = { wares: Handlers };

export const wares = (...middlewares: Handlers): Wares => {
  return { wares: middlewares };
};
