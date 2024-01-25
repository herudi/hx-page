import { getRouteFromDir } from "./deps.ts";
import { writeFile } from "node:fs/promises";
let out = "";
const isDev = Deno.args?.includes("--dev");
if (isDev) {
  out += "// Please, don't remove this file.\n";
  out += "export default void 0;";
} else {
  const route = await getRouteFromDir("pages");
  const arr = Object.keys(route);
  arr.forEach((k, i) => out += `import $${i} from "@hxp/${route[k]}";\n`);
  out += "\n";
  out += "export default {\n";
  arr.forEach((k, i) => out += `  "${k}": $${i},\n`);
  out += "};\n";
}

await writeFile("./pages.ts", out, { encoding: "utf-8" });
