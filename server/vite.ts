import type { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import middie from "@fastify/middie";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: FastifyInstance) {
  // Register middie to enable Express middleware support in Fastify
  await app.register(middie);

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: {
      middlewareMode: true,
      hmr: { server: app.server },
      allowedHosts: true as const,
    },
    appType: "custom",
  });

  // Use Vite's middlewares
  await app.use(vite.middlewares);
  
  // Catch-all route for SPA
  app.get('/*', async (request, reply) => {
    const url = request.url;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // Always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      reply.type("text/html").send(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      reply.status(500).send(e);
    }
  });
}

export async function serveStatic(app: FastifyInstance) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Register @fastify/static plugin
  await app.register(import("@fastify/static"), {
    root: distPath,
    prefix: "/",
  });

  // Fallback to index.html for SPA routing
  app.setNotFoundHandler(async (request, reply) => {
    const indexPath = path.resolve(distPath, "index.html");
    const stream = fs.createReadStream(indexPath);
    reply.type("text/html").send(stream);
  });
}
