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
import type { FC, JSXElement, NJSX, TApp, TObject, TRet } from "./deps.ts";
import { router } from "./hx.ts";
import g_page from "@hxp/pages";

export { hx } from "./hx.ts";
export * from "./deps.ts";
const T_T = Date.now();
const isDeno = typeof Deno !== "undefined";
const isDev = isDeno
  ? Deno.args?.includes("--dev")
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  : process.argv?.includes("--dev");
async function genRoute() {
  const custom = {} as TObject, module = {} as TObject;
  if (g_page === void 0) {
    const route = await getRouteFromDir("pages");
    for (const path in route) {
      const mod = await import("@hxp/" + route[path]);
      if (path.startsWith("/_layout")) custom.layout = mod.default;
      else module[path] = mod;
    }
  } else {
    const route = g_page as TObject;
    for (const path in route) {
      const mod = route[path];
      if (path.startsWith("/_layout")) custom.layout = mod;
      else module[path] = mod;
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
  constructor(
    { target, htmx = {}, ...rest }: HxPageOptions = {},
  ) {
    super(rest);
    htmx.src ??= "https://unpkg.com/htmx.org@1.9.10";
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
      htmx$(htmx),
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
    const App = this.#App;
    const { module, custom } = await genRoute();
    for (const path in module) {
      const mod = module[path];
      const comp = mod.default ?? mod;
      const renderPage = () => {
        return custom.layout ? n(custom.layout, null, n(comp)) : n(comp);
      };
      this.get(path, () => n(App, null, renderPage()) as JSXElement);
      this.get("/__page__" + path, () => renderPage());
    }
    this.use(router);
    this.listen(opts as TAny);
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
