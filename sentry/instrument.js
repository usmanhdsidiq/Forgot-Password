// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
require("dotenv").config();
const Sentry = require("@sentry/node");
const Trace = require("@sentry/tracing");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: "https://1f3fb55c3c5acd5ceaaf05423cc52009@o4508280118771712.ingest.us.sentry.io/4508280121589760",
  integrations: [
    nodeProfilingIntegration(),
  ],
  environment: process.env.ENVIRONMENT,
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});
// Manually call startProfiler and stopProfiler
// to profile the code in between
Sentry.profiler.startProfiler();
// this code will be profiled

// Calls to stopProfiling are optional - if you don't stop the profiler, it will keep profiling
// your application until the process exits or stopProfiling is called.
Sentry.profiler.stopProfiler();