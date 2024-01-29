import { FC, Helmet } from "hxp";
import { etag, twind } from "hxp/wares";

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

// Example apply middleware twind and etag.
export default [twind(), etag(), Layout];
