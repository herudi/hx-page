import { FC, Helmet } from "hxp";
import { twindServer } from "hxp/wares/twind-server.ts";

const Layout: FC = ({ children }) => {
  return (
    <>
      <Helmet>
        <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
      </Helmet>
      <section class="h-screen text-gray-400 bg-gray-900">
        {children}
      </section>
    </>
  );
};

export default [twindServer(), Layout];
