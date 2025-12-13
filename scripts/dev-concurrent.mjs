import concurrently from "concurrently";

// Run frontend (Vite) and backend (Cloudflare Worker via wrangler) together.
concurrently(
  [
    {
      command: "bun run dev:frontend",
      name: "front",
      prefixColor: "cyan",
    },
    {
      command: "bunx wrangler dev",
      name: "worker",
      prefixColor: "magenta",
      cwd: "src/server",
    },
  ],
  {
    killOthersOn: ["failure", "success"],
    restartTries: 0,
    prefix: "name",
  }
)
  .result
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
