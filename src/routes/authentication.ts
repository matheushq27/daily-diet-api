import { knex } from "../database";
import { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { passwordSchema } from "../zod_schemas";
import { randomUUID } from "node:crypto";

const tableUsers = "users";

export function setCookie(resp: FastifyReply) {
  const sessionId = randomUUID();
  resp.cookie("sessionId", sessionId, {
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  return { sessionId };
}

export async function authenticationRoutes(app: FastifyInstance) {
  app.post("/login", async (req, resp) => {
    const userLoginBodySchema = z.object({
      email: z.string().email(),
      password: passwordSchema,
    });

    const { email, password } = userLoginBodySchema.parse(req.body);
    const user = await knex(tableUsers)
      .where({
        email,
        password,
      })
      .first();

    if (!user) {
      return resp.status(404).send();
    }

    const { sessionId } = setCookie(resp);

    const userUpdate = await knex(tableUsers).where("id", user.id).update({
      session_id: sessionId,
    });
    
    user.session_id = sessionId
    return resp.status(201).send({ user });
  });
}
