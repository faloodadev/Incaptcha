import Fastify from "fastify";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const fastify = Fastify({
  logger: false,
  bodyLimit: 10485760, // 10MB
  trustProxy: true,
});

// Add raw body support for request verification
fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, function (req, body, done) {
  try {
    const json = JSON.parse(body.toString());
    done(null, { raw: body, parsed: json });
  } catch (err: any) {
    err.statusCode = 400;
    done(err, undefined);
  }
});

// Request logging middleware
fastify.addHook('onRequest', async (request, reply) => {
  (request as any).startTime = Date.now();
});

fastify.addHook('onResponse', async (request, reply) => {
  const duration = Date.now() - ((request as any).startTime || 0);
  const path = request.url;
  
  if (path.startsWith('/api')) {
    let logLine = `${request.method} ${path} ${reply.statusCode} in ${duration}ms`;
    
    if (logLine.length > 80) {
      logLine = logLine.slice(0, 79) + "…";
    }
    
    log(logLine);
  }
});

(async () => {
  await registerRoutes(fastify);

  // Error handler
  fastify.setErrorHandler(function (error: any, request, reply) {
    const status = error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    reply.status(status).send({ message });
    console.error(error);
  });

  // Setup Vite in development or serve static files in production
  if (process.env.NODE_ENV === "development") {
    await setupVite(fastify);
  } else {
    serveStatic(fastify);
  }

  // Start server
  const port = parseInt(process.env.PORT || '5000', 10);
  
  try {
    await fastify.listen({
      port,
      host: "0.0.0.0",
    });
    log(`serving on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
