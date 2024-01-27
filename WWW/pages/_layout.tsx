import { FC, Helmet } from "hxp";

const Layout: FC = ({ children }) => {
  return (
    <>
      <Helmet>
        <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
        <script src="https://cdn.twind.style" crossorigin></script>
      </Helmet>
      <section class="h-screen text-gray-400 bg-gray-900">
        {children}
      </section>
    </>
  );
};

export default Layout;
