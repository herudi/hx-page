import { existsSync, walk } from "https://deno.land/std@0.213.0/fs/mod.ts";
const args = Deno.args;
const dir = args[args.length - 1];

if (dir === void 0) {
  const message = "cannot find project name";
  throw new TypeError(message);
}
if (existsSync(dir)) {
  console.log(dir, "is exists.");
  console.log("try with other name");
} else {
  const result = walk("template");
  for await (const it of result) {
    const dest = it.path.replace("template", dir);
    if (it.isDirectory) {
      await Deno.mkdir(dest);
    } else {
      await Deno.copyFile(it.path, dest);
    }
  }

  console.log("Success create", dir);
  console.log("");
  console.log("cd", dir);
  console.log("deno task dev");
  console.log("deno task start");
}
