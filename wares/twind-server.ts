import {
  type InlineOptions,
  twindServer as twindServer$,
} from "https://deno.land/x/nhttp@1.3.24/lib/jsx/twind-server.ts";
import { wares } from "./wares.ts";

export const twindServer = (opts: InlineOptions = {}) => {
  return wares(twindServer$(opts));
};
