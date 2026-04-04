import { Queue } from "bullmq";
import Redis from "ioredis";

// Use Redis localhost:6379
const connection = new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null,
});

export const triggerQueue = new Queue("trigger-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
