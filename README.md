# HX-Page

Effortless [Htmx](https://htmx.org) in [Deno](https://deno.com).

## Features

- NextJS like.
- Helmet Support.
- AsyncComponent support.
- Including Hooks `useRequestEvent`, `useResponse`, `useBody` and more.

## Starter

```bash
deno run -Ar https://hxp.deno.dev my_app
```

```bash
cd my_app

// dev
deno task dev

// prod
deno task start
```

## Deploy

```bash
// generate first
deno task pages

// deploy
deployctl deploy --prod --project=my_app main.ts
```

more => https://hxp.deno.dev

## License

[MIT](LICENSE)
