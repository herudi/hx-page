const args = Deno.args;
const dir = args[args.length - 1];
if (dir === void 0) {
  const message = "cannot find project name";
  throw new TypeError(message);
}
const isExist = () => {
  try {
    Deno.statSync(dir);
    return true;
  } catch { /* failure */ }
  return false;
};
if (isExist()) {
  console.log(dir, "is exists.");
  console.log("try with other name");
} else {
  const base = "https://hxp.deno.dev/new/template";
  const res = await fetch(base);
  const arr = await res.json();
  for (let i = 0; i < arr.length; i++) {
    const { type, path } = arr[i];
    const dest = path.replace("template", dir);
    if (type === "dir") {
      await Deno.mkdir(dest);
    } else {
      const res = await fetch(new URL(path, base));
      const text = await res.text();
      await Deno.writeTextFile(dest, text);
    }
  }
  console.log("Success create", dir);
  console.log("");
  console.log("cd", dir);
  console.log("deno task dev");
  console.log("deno task start");
}
