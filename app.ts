import fastify, { FastifyReply, FastifyRequest } from "fastify";
import type { APIInteraction } from "discord-api-types/v10";
import {
  InteractionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import { PlatformAlgorithm, verify } from "discord-verify/node";
import "dotenv/config";

const server = fastify({
  logger: {
    transport: { target: "pino-pretty", options: { singleLine: true } },
  },
});

server.get("/", async (request: FastifyRequest, reply: FastifyReply) =>
  reply.send("FormBot <3")
);

server.addHook(
  "preHandler",
  async (
    request: FastifyRequest<{
      Body: APIInteraction;
      Headers: {
        "X-Signature-Ed25519": string;
        "X-Signature-Timestamp": string;
      };
    }>,
    reply: FastifyReply
  ) => {
    if (request.method !== "POST")
      return reply.status(405).send("Invalid Method");
    server.log.info("Received interaction");
    
    // Verify Request is from Discord
    const signature = request.headers["x-signature-ed25519"];
    const timestamp = request.headers["x-signature-timestamp"];
    const rawBody = JSON.stringify(request.body);

    const isValidRequest = await verify(
      rawBody,
      signature,
      timestamp,
      process.env.APP_PUBLIC_KEY!,
      crypto.subtle,
      PlatformAlgorithm.NewNode
    );

    if (!isValidRequest) {
      server.log.warn("Invalid signature");
      return reply.status(401).send("Invalid signature");
    }
  }
);

server.post(
  "/interactions",
  async (
    request: FastifyRequest<{
      Body: APIInteraction;
    }>,
    reply: FastifyReply
  ) => {
    const interaction = request.body;

    if (interaction.type === InteractionType.Ping) {
      server.log.info("Ping request");
      return reply.send({ type: InteractionResponseType.Pong });
    }
  }
);
server.listen({ port: 3001 }, () => console.log("FormBot is running..."));
