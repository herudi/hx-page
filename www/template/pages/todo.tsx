import { FC, Helmet, hx, Link, useBody } from "hxp";

type Todo = { text: string };

const todos = [] as Todo[];

const addTodo = hx.post(() => {
  const todo = useBody<Todo>();
  todos.unshift(todo);
  return <li>{todo.text}</li>;
});

const Todo: FC = () => {
  return (
    <>
      <Helmet>
        <title>Todo App</title>
      </Helmet>
      <div class="container px-5 py-24 mx-auto">
        <div class="flex flex-col text-center mb-12 mt-10">
          <h1 class="text-6xl font-medium title-font mb-4 text-white">
            Todo App
          </h1>
          <p class="text-2xl mx-auto leading-relaxed">
            {"<<"} <Link to="/" class="underline italic">Back To Home</Link>
          </p>
        </div>
        <div class="mt-10 flex flex-col text-center">
          <form
            hx-on--after-request="this.reset()"
            hx-swap="afterbegin"
            hx-post={addTodo}
            hx-target="#todo"
          >
            <input
              placeholder="Todo text..."
              type="text"
              name="text"
              autoComplete="off"
              class="bg-gray-800 py-1.5 bg-opacity-40 rounded border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-900 focus:bg-transparent text-base outline-none text-gray-100 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              required
            />
            <label class="m-1"></label>
            <button
              type="submit"
              class="text-white bg-blue-500 border-0 py-2 px-4 focus:outline-none hover:bg-blue-600 rounded text-lg"
            >
              + Add
            </button>
          </form>
        </div>
        <div class="mt-5 flex justify-center">
          <div style={{ width: 280 }}>
            <ul class="list-decimal" id="todo">
              {todos.map((todo) => <li>{todo.text}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Todo;
