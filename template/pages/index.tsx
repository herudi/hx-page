import { FC, Helmet, Link, NJSX } from "hxp";

const Anchor: FC<NJSX.AnchorHTMLAttributes> = (props) => (
  <a class="underline font-bold italic" {...props}>{props.children}</a>
);

const Home: FC = () => {
  return (
    <>
      <Helmet>
        <title>Home Page</title>
      </Helmet>
      <div class="container px-5 py-24 mx-auto">
        <div class="flex flex-col text-center w-full mb-12 mt-10">
          <h1 class="text-6xl font-medium title-font mb-4 text-white">
            HX-Page
          </h1>
          <p class="text-2xl mx-auto leading-relaxed">
            Effortless{" "}
            <Anchor href="https://htmx.org" target="_blank">
              Htmx
            </Anchor>{" "}
            in{" "}
            <Anchor href="https://deno.com" target="_blank">
              Deno
            </Anchor>.
          </p>
          <div class="mt-10">
            <Link
              href="/todo"
              class="text-white bg-blue-500 border-0 py-2 px-8 focus:outline-none hover:bg-blue-600 rounded text-lg"
            >
              Todo {">>"}
            </Link>
            <label class="m-2"></label>
            <a
              href="/doc"
              class="text-white bg-blue-500 border-0 py-2 px-8 focus:outline-none hover:bg-blue-600 rounded text-lg"
            >
              Doc {">>"}
            </a>
          </div>
          <div class="mx-auto leading-relaxed mt-10">
            <span>
              Try to edit in{" "}
              <span class="underline italic">pages/index.tsx</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
