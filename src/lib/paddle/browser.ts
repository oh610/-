"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddleInstance: Paddle | null = null;
let loading: Promise<Paddle | null> | null = null;

export function getPaddle(): Promise<Paddle | null> {
  if (paddleInstance) return Promise.resolve(paddleInstance);
  if (loading) return loading;

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    console.error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set");
    return Promise.resolve(null);
  }

  loading = initializePaddle({
    token,
    environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
  }).then((instance) => {
    paddleInstance = instance ?? null;
    return paddleInstance;
  });

  return loading;
}
