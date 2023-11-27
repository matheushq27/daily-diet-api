import fastify from "fastify";
import { env } from "./env";
import { usersRoutes } from "./routes/users";
import { authenticationRoutes } from "./routes/authentication";
import cookie from "@fastify/cookie";

const app = fastify();

app.register(cookie);
app.register(usersRoutes, {
  prefix: "users",
});
app.register(authenticationRoutes, {
  prefix: "authentication",
});

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });