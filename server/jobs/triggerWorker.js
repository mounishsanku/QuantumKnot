// import { Worker } from "bullmq";
// import Redis from "ioredis";
// import { processTrigger } from "../services/triggerEngine.js";
// import logger from "../logger.js";

// const connection = new Redis({
//   host: "localhost",
//   port: 6379,
//   maxRetriesPerRequest: null,
// });

export function startTriggerWorker(io) {
//   const worker = new Worker(
//     "trigger-processing",
//     async (job) => {
//       logger.info(`Job started: ${job.id} for rider ${job.data.riderId} - ${job.data.triggerType}`);
//       const { riderId, triggerType, triggerValue, zone } = job.data;
//       
//       const claim = await processTrigger(io, riderId, triggerType, triggerValue, zone);
//       
//       logger.info(`Job success: ${job.id}`);
//       return claim;
//     },
//     { connection }
//   );

//   worker.on("failed", (job, err) => {
//     logger.error(`Job failed: ${job?.id} with error ${err.message}`);
//   });

//   logger.info("Trigger worker started");
//   return worker;
}
