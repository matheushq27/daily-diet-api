import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { passwordSchema } from "../zod_schemas";

const tableUsers = "users";

export async function usersRoutes(app: FastifyInstance) {
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
