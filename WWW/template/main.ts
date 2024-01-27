import { etag, HxPage } from "hxp";

const app = new HxPage();

// optional middleware
app.use(etag());

app.serve();
