import { etag, HxPage } from "hxp";
import { walk } from "https://deno.land/std@0.213.0/fs/mod.ts";

type Template = {
  path: string;
  type: "file" | "dir";
};

const cache = {} as {
  arr: Template[];
  file: Record<string, string>;
  script: string;
};

const app = new HxPage();

app.get("/new", (rev) => {
  rev.response.type("ts");
  return cache.script ??= Deno.readTextFileSync("./new.ts");
});
app.get("/new/template", async () => {
  if (cache.arr !== void 0) return cache.arr;
  const result = walk("template");
  const arr = [] as Template[];
  for await (const it of result) {
    arr.push({ type: it.isDirectory ? "dir" : "file", path: it.path });
  }
  return cache.arr = arr;
});
app.get("/new/template/:slug*", ({ params }) => {
  cache.file ??= {};
  const name = "./template/" + params.slug.join("/");
  return cache.file[name] ??= Deno.readTextFileSync(name);
});
app.use(etag());
app.serve();
