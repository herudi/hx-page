import { FC, n, Router, TRet } from "./deps.ts";
export const ANY_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
] as const;
export const router = new Router();
let idx = -1;
class Hx {
  constructor() {
    ANY_METHODS.forEach((method) => {
      (this as TRet)[method.toLowerCase()] = (el: TRet, suffix = "") => {
        if (suffix === "/") suffix = "";
        const path = "/hxp" + idx--;
        router.add(method, path + suffix, () => n(el, null));
        return path;
      };
    });
  }
  get!: <T>(elem: FC<T>, suffix?: string) => string;
  post!: <T>(elem: FC<T>, suffix?: string) => string;
  put!: <T>(elem: FC<T>, suffix?: string) => string;
  patch!: <T>(elem: FC<T>, suffix?: string) => string;
  delete!: <T>(elem: FC<T>, suffix?: string) => string;
}
export const hx = new Hx();
