import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { passwordSchema } from "../zod_schemas";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

const tableUsers = "users";
const tableMeals = "meals";

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    "/metrics/:user_id",
    { preHandler: [checkSessionIdExists] },
    async (req) => {
      const createMealsBodySchema = z.object({
        user_id: z.string(),
      });

      const { user_id } = createMealsBodySchema.parse(req.params);

      const totalMeals = await knex(tableMeals)
        .where("user_id", user_id)
        .count("* as total_meals")
        .first();

      const included = await knex(tableMeals)
        .where({
          user_id,
          included: true,
        })
        .count("* as included")
        .first();

      const notIncluded = await knex(tableMeals)
        .where({
          user_id,
          included: false,
        })
        .count("* as notIncluded")
        .first();

      const bestSequence = await knex(tableMeals)
        .select("*")
        .where("user_id", user_id)
        .orderBy("date_time", "asc")

      const totalMealsIncluded = { ...included, ...notIncluded };

      return {
        metrics: { ...totalMeals, ...totalMealsIncluded, bestSequence },
      };
    }
  );

  app.get("/", async (req, resp) => {
    const users = await knex(tableUsers).select("*");
    return { users };
  });

  app.post("/", async (req, resp) => {
    const createUserBodySchema = z.object({
      name: z.string().min(2),
      last_name: z.string().min(2),
      email: z.string().email(),
      password: passwordSchema,
    });

    const { name, last_name, email, password } = createUserBodySchema.parse(
      req.body
    );

    const sessionId = randomUUID();
    resp.cookie("sessionId", sessionId, {
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    await knex(tableUsers).insert({
      id: randomUUID(),
      name,
      last_name,
      email,
      password,
      session_id: sessionId,
    });

    return resp.status(201).send();
  });
}
