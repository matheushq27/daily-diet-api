import { knex } from "../database";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { dateTimeSchema } from "../zod_schemas";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

const tableMeals = "meals";
const tableUsers = "users";

export async function mealsRoutes(app: FastifyInstance) {

  app.get(
    "/list/:userId",
    { preHandler: [checkSessionIdExists] },
    async (req, resp) => {
      const createMealsBodySchema = z.object({
        userId: z.string(),
      });
      const { userId } = createMealsBodySchema.parse(req.params);
      const user = await knex(tableUsers).where("id", userId).select("*");

      if (!user) {
        return {
          meals: [],
        };
      }

      const meals = await knex(tableMeals).where("user_id", userId).select("*");
      return { meals };
    }
  );

  app.get(
    "/:user_id/:id",
    { preHandler: [checkSessionIdExists] },
    async (req, resp) => {
      const createMealsBodySchema = z.object({
        id: z.string(),
        user_id: z.string(),
      });
      const { id, user_id } = createMealsBodySchema.parse(req.params);
      const meal = await knex(tableMeals)
        .where({
          id,
          user_id,
        })
        .first();

      if (!meal) {
        return resp.status(404).send({});
      }
      return { meal };
    }
  );

  app.delete(
    "/:user_id/:id",
    { preHandler: [checkSessionIdExists] },
    async (req, resp) => {
      const createMealsBodySchema = z.object({
        id: z.string(),
        user_id: z.string(),
      });
      const { id, user_id } = createMealsBodySchema.parse(req.params);
      const meal = await knex(tableMeals)
        .where({
          id,
          user_id,
        })
        .del();

      if (!meal) {
        return resp.status(404).send();
      }

      return resp.status(204).send();
    }
  );

  app.patch(
    "/:user_id/:id",
    { preHandler: [checkSessionIdExists] },
    async (req, resp) => {
      const updateMealsBodySchemaId = z.object({
        id: z.string(),
        user_id: z.string(),
      });

      const { id, user_id } = updateMealsBodySchemaId.parse(req.params);

      const _meal = await knex(tableMeals).where("user_id", user_id).first();

      if (!_meal) {
        resp.status(404).send({
          error: "Not found.",
        });
      }

      const updateMealsBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date_time: dateTimeSchema.optional(),
        included: z.boolean().optional(),
      });

      const { name, description, date_time, included } =
        updateMealsBodySchema.parse(req.body);

      if (name === "" || description === "" || date_time === "") {
        resp.status(400).send({
          error: "Empty Fields.",
        });
      }

      const meal = await knex(tableMeals)
        .where({
          id,
          user_id,
        })
        .update({
          name,
          description,
          date_time,
          included,
        });

      if (!meal) {
        resp.status(400).send({
          error: "Update Error.",
        });
      }

      return resp.status(200).send();
    }
  );

  app.post("/", { preHandler: [checkSessionIdExists] }, async (req, resp) => {
    const createMeal = z.object({
      name: z.string(),
      description: z.string(),
      date_time: dateTimeSchema,
      included: z.boolean(),
      user_id: z.string().uuid(),
    });

    const { name, description, date_time, user_id, included } =
      createMeal.parse(req.body);

    await knex(tableMeals).insert({
      name,
      description,
      date_time,
      user_id,
      included,
    });

    return resp.status(201).send();
  });
}
