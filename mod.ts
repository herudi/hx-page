import {
  getRouteFromDir,
  Helmet,
  htmx as htmx$,
  n,
  NHttp,
  renderToHtml,
  Script,
  serveStatic,
  useRequestEvent,
  useStyle as useStyle$,
} from "./deps.ts";
import type { FC, JSXElement, NJSX, TApp, TObject, TRet } from "./deps.ts";
import { useId } from "./deps.ts";
import { isArray, mergeElem, router } from "./hx.ts";
import g_page from "hxp/pages";

export { hx } from "./hx.ts";
export * from "./deps.ts";
const ID = useId();
const isDev = Deno.args.includes("--dev");

function filterModule(
  path: string,
  data: TAny,
  { custom, module }: TObject = {},
) {
  if (path === "/_layout") custom.layout = data;
  else if (path === "/_wares") custom.wares = data;
  else if (path === "/_404") custom.not_found = data;
  else if (path === "/_error") custom.error = data;
  else {
    const idx = path.indexOf("/_layout");
    if (idx !== -1) {
      module[path] = {
        wares: isArray(data) ? data : [data],
        key: path.slice(0, idx),
      };
    } else {
      module[path] = data;
    }
    const cpath = module[path]?.key;
    if (cpath) {
      const wares = module[path].wares;
      for (const k in module) {
        if (k.startsWith(cpath) && !k.includes("/_layout")) {
          const last = module[k];
          if (last !== void 0 && last.only === void 0) {
            module[k] = wares.concat(last ?? []).flat(10);
          }
        }
      }
      delete module[path];
    }
  }
  return { custom, module };
}
async function genRoute() {
  const custom = {} as TObject, module = {} as TObject;
  if (g_page === void 0) {
    const route = await getRouteFromDir("pages");
    for (const path in route) {
      const mod = await import("hxp/" + route[path]);
      filterModule(path, mod.default, { custom, module });
    }
  } else {
    const route = g_page as TObject;
    for (const path in route) {
      const mod = route[path];
      filterModule(path, mod, { custom, module });
    }
  }
  return { module, custom };
}

declare global {
  namespace NHTTP {
    interface RequestEvent {
      hxPageTarget: string;
    }
  }
}
const def_target_app = "hxpage";

type TAny = TRet;

export interface HxPageOptions extends TApp {
  htmx?: NJSX.ScriptHTMLAttributes;
  target?: string;
}
export class HxPage extends NHttp {
  #App!: FC;
  #htmx!: NJSX.ScriptHTMLAttributes;
  constructor(
    { target, htmx = {}, ...rest }: HxPageOptions = {},
  ) {
    super(rest);
    htmx.src ??= "https://unpkg.com/htmx.org@1.9.10";
    this.#htmx = htmx;
    target ??= def_target_app;
    this.#App = ({ children }) => {
      return n("div", { id: target }, [
        children,
        isDev && n(Helmet, null, n("script", { src: `/DEV_${ID}.js` })),
        n(
          Helmet,
          { footer: true },
          n(
            Script,
            null,
            `(function(){var t=document.getElementById("${target}");if(t)t.addEventListener("htmx:responseError",function(e){window.location.href=e.target.href})})();`,
          ),
        ),
      ]);
    };
    this.engine(renderToHtml).use(
      serveStatic("public", { prefix: "/assets", etag: true }),
      (rev, next) => {
        rev.hxPageTarget = target as string;
        return next();
      },
    );
    if (isDev) {
      this.get("/__REFRESH__", ({ response }) => {
        response.type("text/event-stream");
        return new ReadableStream({
          start(controller) {
            controller.enqueue(`data: reload\nretry: 100\n\n`);
          },
        }).pipeThrough(new TextEncoderStream());
      });
      this.get(`/DEV_${ID}.js`, (rev) => {
        rev.response.type("js");
        return `(() => {let bool = false; new EventSource("/__REFRESH__").addEventListener("message", _ => {if (bool) location.reload(); else bool = true;});})();`;
      });
    }
  }

  async serve(opts: Deno.ServeOptions = {}) {
    opts.port ??= 8000;
    this.use(htmx$(this.#htmx));
    const { module, custom } = await genRoute();
    if (custom.wares) {
      this.use(
        custom.wares.flat(10).map((el: TRet) => el?.wares ? el.wares : el),
      );
    }
    const App = this.#App;
    let lay: TObject | undefined;
    if (custom.layout) lay = mergeElem(custom.layout);
    for (const path in module) {
      let { elem, wares } = mergeElem(module[path]);
      if (elem?.only) {
        elem = n(elem.only);
      } else if (lay) {
        wares = lay.wares.concat(wares);
        elem = n(lay.elem.type, lay.elem.props, elem);
      }
      this.get(
        path,
        wares,
        (rev) => rev.hxRequest ? elem : n(App, null, elem) as JSXElement,
      );
    }
    this.use(router);
    if (custom.error) this.onError((error) => n(custom.error, { error }));
    if (custom.not_found) this.on404(() => n(custom.not_found, null));
    this.listen(opts as TRet);
  }
}

export const Link: FC<
  NJSX.AnchorHTMLAttributes & { to: string }
> = (props) => {
  const rev = useRequestEvent();
  props.href = props.to;
  const url = props.href;
  const v = rev.__cc ? ID : "0";
  props["hx-get"] ??= url + `${url.indexOf("?") === -1 ? "?" : "&"}__v=${v}`;
  props["hx-target"] ??= "#" + rev.hxPageTarget;
  props["hx-push-url"] ??= url;
  return n("a", props, props.children as JSXElement);
};

export const useStyle = (
  css: Record<string, NJSX.CSSProperties> | string,
  options: { position?: "head" | "footer"; hxRequest?: boolean } = {},
) => {
  if (options.hxRequest === false) {
    const rev = useRequestEvent();
    if (rev.hxRequest === false) {
      return useStyle$(css, { position: options.position });
    }
    return null;
  }
  return useStyle$(css, { position: options.position });
};

export const useRouter = () => {
  return useRequestEvent().route;
};

export const noLayout = <T = TAny>(elem: FC<T>) => ({ only: elem });
