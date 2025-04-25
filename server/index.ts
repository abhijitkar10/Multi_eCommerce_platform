import express, { type Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load environment variables
dotenv.config();

// Ensure required Twilio environment variables are provided.
if (
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_AUTH_TOKEN ||
  !process.env.TWILIO_VERIFY_SERVICE_SID
) {
  console.error("❌ Missing Twilio environment variables.");
  process.exit(1);
}

console.log("✅ Twilio env vars loaded.");

// Create Express app
const app = express();

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware to capture response time and JSON responses on API routes.
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  // Monkey-patch res.json to capture response body for logging.
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // On finish, log method, path, status and response details for API endpoints.
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      // Truncate log line if too long.
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Chatbot endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  // Simple bot response logic
  let reply = 'Sorry, I didn’t understand that.';
  if (message.toLowerCase().includes('hello')) {
    reply = 'Hello! How can I assist you today?';
  }

  res.json({ reply });
});

// Async function to register routes and start the server.
(async () => {
  const server = await registerRoutes(app);

  // Global error handler: logs error details and responds with an error message.
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("🔥 Global Error:", message);
    res.status(status).json({ message });
    // Optionally rethrow or handle the error further if desired.
  });

  // Setup frontend server based on the environment.
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Always serve on a dynamic port with a fallback to 5000.
  const PORT = process.env.PORT || 5000;

  server.listen(
    {
      port: PORT,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`🚀 Server ready on http://localhost:${PORT}`);
    }
  );
})();
