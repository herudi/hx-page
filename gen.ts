import { getRouteFromDir } from "./deps.ts";
let out = "";
const isDev = Deno.args?.includes("--dev");
if (isDev) {
  out += "// please, don't remove or modify this file.\n";
  out += "export default void 0;";
} else {
  const route = await getRouteFromDir("pages");
  const arr = Object.keys(route);
  arr.forEach((k, i) => out += `import $${i} from "hxp/${route[k]}";\n`);
  out += "\n";
  out += "export default {\n";
  arr.forEach((k, i) => out += `  "${k}": $${i},\n`);
  out += "};\n";
}

Deno.writeTextFileSync("./pages.ts", out);
