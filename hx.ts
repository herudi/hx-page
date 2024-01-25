import { FC, n, Router, TRet } from "./deps.ts";
export const ANY_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
] as const;
export const router = new Router();
type FCArray = Array<FC<TRet> | FC<TRet>[]>;
type HXC = string | FC<TRet> | FCArray;
let idx = -1;
const isFn = <T>(v: T) => typeof v === "function";
const isArr = Array.isArray;
const toChild = (el: TRet) => isFn(el) ? n(el, null) : el;
export const toElem = (el: TRet | TRet[]) => {
  if (isArr(el)) {
    return el.length === 1 ? toChild(el[0]) : el.reduceRight((acc, curr) => {
      curr = toChild(curr);
      (curr.props ??= {}).children = toChild(acc);
      return curr;
    });
  }
  return toChild(el);
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
        const elem = toElem(el);
        router.add(method, path + prefix, () => elem);
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
