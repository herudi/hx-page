import { wares } from "./wares.ts";

declare global {
  namespace NHTTP {
    interface RequestEvent {
      disableEtag?: boolean;
    }
  }
}
async function createHash(ab: ArrayBuffer) {
  if (ab.byteLength === 0) return "47DEQpj8HBSa+/TImW+5JCeuQeR";
  let hash = "";
  const buf = await crypto.subtle.digest("SHA-1", ab);
  new Uint8Array(buf).forEach((el) => (hash += el.toString(16)));
  return hash;
}
export const etag = ({ weak }: { weak?: boolean } = {}) => {
  weak ??= true;
  return wares(async (rev, next) => {
    if (rev.method === "GET") {
      const { request, response } = rev;
      const nonMatch = request.headers.get("if-none-match");
      const res = await next();
      if (rev.disableEtag) return;
      let etag = res.headers.get("etag");
      let ab: ArrayBuffer | undefined;
      if (etag === null) {
        ab = await res.arrayBuffer();
        const hash = await createHash(ab);
        etag = weak ? `W/"${hash}"` : `"${hash}"`;
      }
      res.headers.forEach((v, k) => response.setHeader(k, v));
      response.setHeader("etag", etag as string);
      if (nonMatch !== null && nonMatch === etag) {
        response.status(304);
        rev.respondWith(new Response(null, response.init));
      } else if (ab !== void 0) {
        rev.respondWith(new Response(ab, response.init));
      }
      return;
    }
    return next();
  });
};
