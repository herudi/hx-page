# HX-Page

Effortless [Htmx](https://htmx.org) in [Deno](https://deno.com).

## Features

- NextJS Router like.
- Helmet Support.
- AsyncComponent support.
- Middleware support : `ETag`, `cache-control`, `twind` and more.
- Including Hooks : `useRequestEvent`, `useRouter`, `useBody` and more.

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

## Code Snippet

```tsx
// pages/todo.tsx

import { FC, Helmet, hx, useBody } from "hxp";

type Todo = { text: string };

const addTodo = hx.post(async () => {
  const todo = useBody<Todo>();

  // example save todo to db.
  await db.todo.save(todo);

  return <li>{todo.text}</li>;
});

const Todo: FC = async () => {
  // example load todos from db.
  const todos = await db.todo.findAll();

  return (
    <>
      <Helmet>
        <title>Todo</title>
      </Helmet>
      <form
        hx-on--after-request="this.reset()"
        hx-swap="afterbegin"
        hx-post={addTodo}
        hx-target="#todo"
      >
        <input name="text" type="text" />
        <button type="submit">Submit</button>
      </form>
      <ul id="todo">
        {todos.map((todo) => <li>{todo.text}</li>)}
      </ul>
    </>
  );
};

export default Todo;
```

## Deploy

```bash
// generate page first
deno task pages

// deploy
deployctl deploy --prod --project=my_app main.ts
```

more => https://hxp.deno.dev

## License

[MIT](LICENSE)
