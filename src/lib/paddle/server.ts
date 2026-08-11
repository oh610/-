import { Paddle, Environment } from "@paddle/paddle-node-sdk";

let client: Paddle | null = null;

export function getPaddleClient(): Paddle {
  if (!client) {
    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) throw new Error("PADDLE_API_KEY is not set");
    client = new Paddle(apiKey, {
      environment: process.env.PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
    });
  }
  return client;
}
