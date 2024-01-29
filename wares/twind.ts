import { createHookScript, type NJSX } from "../deps.ts";
import { wares } from "./wares.ts";

export const twind = (opts: NJSX.ScriptHTMLAttributes = {}) => {
  opts.src ??= "https://cdn.twind.style";
  opts.crossOrigin ??= "";
  return wares((rev, next) => {
    createHookScript(opts, rev);
    return next();
  });
};
