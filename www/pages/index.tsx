import { FC, Helmet, NJSX, useRequestEvent } from "hxp";

const Anchor: FC<NJSX.AnchorHTMLAttributes> = (props) => (
  <a class="underline font-bold italic" {...props}>{props.children}</a>
);

const Home: FC = () => {
  const { request, response } = useRequestEvent();
  const agent = request.headers.get("user-agent");
  if (agent && agent.startsWith("Deno")) {
    return response.redirect("/new");
  }
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
          <p
            class="mx-auto mt-10 p-5"
            style={{ backgroundColor: "black", borderRadius: 10 }}
          >
            deno run -Ar https://hxp.deno.dev my_app
          </p>
          <p class="mt-20 text-2xl mx-auto leading-relaxed">
            Doc (<i>soon...</i>)
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
