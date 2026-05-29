import { Router } from "express";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../validation/commnetarry.js";
import { matchIdParamSchema } from "../validation/matches.js";

export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

commentaryRouter.get("/", async (req, res) => {
  // Validate match ID in params
  const paramsValidation = matchIdParamSchema.safeParse(req.params);
  if (!paramsValidation.success) {
    return res.status(400).send({
      error: "Invalid match ID.",
      details: paramsValidation.error.issues,
    });
  }

  // Validate query parameters
  const queryValidation = listCommentaryQuerySchema.safeParse(req.query);
  if (!queryValidation.success) {
    return res.status(400).send({
      error: "Invalid query parameters.",
      details: queryValidation.error.issues,
    });
  }

  try {
    const matchId = paramsValidation.data.id;
    const limit = Math.min(queryValidation.data.limit ?? 100, MAX_LIMIT);

    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    res.status(200).send({ data });
  } catch (e) {
    console.error("Failed to fetch commentary", e);
    res.status(500).send({
      error: "Failed to fetch commentary.",
    });
  }
});

commentaryRouter.post("/", async (req, res) => {
  console.log(req.params);

  // Validate match ID in params
  const paramsValidation = matchIdParamSchema.safeParse(req.params);
  if (!paramsValidation.success) {
    return res.status(400).send({
      error: "Invalid match ID.",
      details: paramsValidation.error.issues,
    });
  }

  // Validate request body
  const bodyValidation = createCommentarySchema.safeParse(req.body);
  if (!bodyValidation.success) {
    return res.status(400).send({
      error: "Invalid commentary payload.",
      details: bodyValidation.error.issues,
    });
  }

  try {
    const matchId = paramsValidation.data.id;
    const {
      minutes,
      sequence,
      period,
      eventType,
      actor,
      team,
      message,
      metadata,
      tags,
    } = bodyValidation.data;

    const [result] = await db
      .insert(commentary)
      .values({
        matchId,
        minute: minutes,
        sequence,
        period,
        eventType,
        actor,
        team,
        message,
        metadata,
        tags,
      })
      .returning();

    if (res.app.locals.broadcastCommentary) {
      res.app.locals.broadcastCommentary(result.matchId, result);
    }

    res.status(201).send({ data: result });
  } catch (e) {
    console.error("Failed to create commentary", e);
    res.status(500).send({
      error: "Failed to create commentary.",
    });
  }
});
