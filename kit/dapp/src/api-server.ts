import { api } from "@/lib/api";

const dev = process.env.NODE_ENV !== "production";
// Always run the api on port 3001
// next.js middleware does a proxy for the api routes, never needs to be exposed outside of the container
const port = 3001;

api.listen(port);

console.log(
  `> API server listening at http://localhost:${port} as ${
    dev ? "development" : process.env.NODE_ENV
  }`
);
