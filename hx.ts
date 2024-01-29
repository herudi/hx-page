import { type FC, type Handler, n, Router, type TRet } from "./deps.ts";
import type { Wares } from "./wares.ts";
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
export const isArray = Array.isArray;
const toElem = (el: FC<TRet> | ChildNode) => isFn(el) ? n(el as FC) : el;
type DataMergeElem = ChildNode | FC<TRet> | Wares | TRet;
export const mergeElem = (el: DataMergeElem | DataMergeElem[]) => {
  if (isArray(el)) {
    el = el.flat(10);
    const wares = [] as Handler[], elems = [] as TRet[];
    el.forEach((el: TRet) => {
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
      wares: wares.flat(10),
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
