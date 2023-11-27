import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { passwordSchema } from "../zod_schemas";

const tableUsers = "users";

export async function mealsRoutes(app: FastifyInstance) {
  app.get("/", async (req, resp) => {
    
  });

  app.post("/", async (req, resp) => {
   
  });
}
