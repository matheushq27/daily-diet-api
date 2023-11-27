import fastify from "fastify";
import { env } from "./env";
import { usersRoutes } from "./routes/users";
import { authenticationRoutes } from "./routes/authentication";
import { mealsRoutes } from "./routes/meals";
import cookie from "@fastify/cookie";

const app = fastify();

app.register(cookie);
app.register(authenticationRoutes, {
  prefix: "authentication",
});
app.register(mealsRoutes, {
  prefix: "meals",
});
app.register(usersRoutes, {
  prefix: "users",
});


app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });
