import { wares } from "./wares.ts";

export type CacheControl = {
  value?: string;
  hxRequest?: false;
};

export const cacheControl = (opts: CacheControl = {}) => {
  opts.value ??= "public, max-age=31536000, immutable";
  return wares((rev, next) => {
    rev.__cc = true;
    const hxRequest = opts.hxRequest ?? rev.hxRequest;
    if (hxRequest && rev.method === "GET") {
      rev.disableEtag = true;
      rev.response.setHeader("cache-control", opts.value as string);
      return next();
    }
    return next();
  });
};
