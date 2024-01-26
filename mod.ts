import {
  getRouteFromDir,
  Helmet,
  htmx as htmx$,
  n,
  NHttp,
  renderToHtml,
  serveStatic,
  useRequestEvent,
  useStyle as useStyle$,
} from "./deps.ts";
import type {
  FC,
  Handlers,
  JSXElement,
  NJSX,
  TApp,
  TObject,
  TRet,
} from "./deps.ts";
import { mergeElem, router } from "./hx.ts";
import g_page from "hxp/pages";

export { hx } from "./hx.ts";
export * from "./deps.ts";
const T_T = Date.now();
const isDev = Deno.args.includes("--dev");

function filterModule(
  path: string,
  data: TAny,
  { custom, module }: TObject = {},
) {
  if (path.startsWith("/_layout")) custom.layout = data;
  else if (path.startsWith("/_404")) custom.not_found = data;
  else if (path.startsWith("/_error")) custom.error = data;
  else module[path] = data;
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
    if (isDev) {
      this.#App = ({ children }) =>
        n("div", { id: target }, [
          children,
          n(Helmet, null, n("script", { src: `/DEV_${T_T}.js` })),
        ]);
    } else {
      this.#App = ({ children }) => n("div", { id: target }, children);
    }
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
      this.get(`/DEV_${T_T}.js`, (rev) => {
        rev.response.type("js");
        return `(() => {let bool = false; new EventSource("/__REFRESH__").addEventListener("message", _ => {if (bool) location.reload(); else bool = true;});})();`;
      });
    }
  }

  async serve(opts: Deno.ServeOptions = {}) {
    opts.port ??= 8000;
    this.use(htmx$(this.#htmx));
    const App = this.#App;
    const { module, custom } = await genRoute();
    let lay: TObject | undefined;
    if (custom.layout) {
      lay = mergeElem(custom.layout);
      if (lay.wares.length) this.use(lay.wares);
    }
    for (const path in module) {
      const { elem, wares } = mergeElem(module[path]);
      const page = lay ? n(lay.elem.type, lay.elem.props, elem) : elem;
      this.get(path, wares, () => n(App, null, page) as JSXElement);
      this.get("/__page__" + path, wares, () => page);
    }
    this.use(router);
    if (custom.error) this.onError((error) => n(custom.error, { error }));
    if (custom.not_found) this.on404(() => n(custom.not_found, null));
    this.listen(opts as TRet);
  }
}

export const Link: FC<
  NJSX.AnchorHTMLAttributes
> = (props) => {
  const rev = useRequestEvent();
  const url = props.href;
  props["hx-get"] = "/__page__" + (url === "/" ? "" : url);
  props["hx-target"] = "#" + rev.hxPageTarget;
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

export const wares = (...middlewares: Handlers) => {
  return { wares: middlewares.flat() };
};
