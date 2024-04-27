import Fastify from "fastify";
import {
  InteractionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import "dotenv/config";
import { verify } from "discord-verify";

const server = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: { singleLine: true },
    },
  },
});

server.post("/interactions", async (request, response) => {
  const signature = request.headers["x-signature-ed25519"];
  const timestamp = request.headers["x-signature-timestamp"];
  const rawBody = JSON.stringify(request.body);

  const isValidRequest = await verify(
    rawBody,
    signature,
    timestamp,
    process.env.APP_PUBLIC_KEY,
    crypto.subtle
  );

  if (!isValidRequest) {
    server.log.warn("Invalid signature");
    return response.status(401).send("Invalid signature");
  } else {
    server.log.info("Valid Signature");
  }
  /**
   * @type {import("discord-api-types/v10").APIInteraction}
   */
  const interaction = request.body;
  switch (interaction.type) {
    case InteractionType.Ping:
      return response.send({ type: InteractionResponseType.Pong });
    case InteractionType.ApplicationCommand:
    // TODO
  }
});

server.listen({ port: 3001 }, () => console.log("FormBot is listening..."));
