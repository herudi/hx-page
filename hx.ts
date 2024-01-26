import { FC, Handler, n, Router, TRet } from "./deps.ts";
export const ANY_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
] as const;
export const router = new Router();
type FCHandler = FC<TRet> | { wares: Handler[] };
type FCHandlers = Array<FCHandler | FCHandler[]>;
type HXC = string | FCHandler | FCHandlers;
let idx = -1;
const isFn = <T>(v: T) => typeof v === "function";
const isArr = Array.isArray;
const toElem = (el: TRet) => isFn(el) ? n(el) : el;
export const mergeElem = (el: TRet | TRet[]) => {
  if (isArr(el)) {
    const wares = [] as TRet[], elems = [] as TRet[];
    el.forEach((el) => {
      if (el?.wares !== void 0) wares.push(el.wares);
      else elems.push(el);
    });
    return {
      elem: elems.length === 1
        ? toElem(elems[0])
        : elems.reduceRight((acc, curr) => {
          curr = toElem(curr);
          (curr.props ??= {}).children = toElem(acc);
          return curr;
        }),
      wares: wares.flat(),
    };
  }
  return { elem: toElem(el), wares: [] };
};
class Hx {
  constructor() {
    ANY_METHODS.forEach((method) => {
      (this as TRet)[method.toLowerCase()] = (
        prefix: string | TRet[],
        ...el: TRet[]
      ) => {
        if (typeof prefix === "string") {
          if (prefix === "/") prefix = "";
        } else {
          el = [prefix].concat(el).flat();
          prefix = "";
        }
        const path = "/hxp" + idx--;
        const { elem, wares } = mergeElem(el);
        router.add(method, path + prefix, wares, () => elem);
        return path;
      };
    });
  }
  get!: (prefix: HXC, ...elems: HXC[]) => string;
  post!: (prefix: HXC, ...elems: HXC[]) => string;
  put!: (prefix: HXC, ...elems: HXC[]) => string;
  patch!: (prefix: HXC, ...elems: HXC[]) => string;
  delete!: (prefix: HXC, ...elems: HXC[]) => string;
}
export const hx = new Hx();
