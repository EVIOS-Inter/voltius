import { info, warn, error, debug } from "@tauri-apps/plugin-log";

type Fwd = (message: string) => Promise<void>;

let verbose = false;

export function setLoggerVerbose(enabled: boolean): void {
  verbose = enabled;
}

function fmt(msg: string, args: unknown[]): string {
  const extra = args.length
    ? " " + args.map((a) => (typeof a === "string" ? a : safeJson(a))).join(" ")
    : "";
  return `[fe] ${msg}${extra}`;
}

function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function make(consoleMethod: "info" | "warn" | "error" | "debug", fwd: Fwd, gated = false) {
  return (msg: string, ...args: unknown[]) => {
    // Resolved at call time (not bound at import time) so console spies in tests work.
    console[consoleMethod](msg, ...args);
    if (gated && !verbose) return;
    // Fire-and-forget; never let logging throw into callers.
    void Promise.resolve(fwd(fmt(msg, args))).catch(() => {});
  };
}

export const log = {
  info: make("info", info),
  warn: make("warn", warn),
  error: make("error", error),
  debug: make("debug", debug, true),
};

let installed = false;

export function installGlobalErrorLogging(): void {
  if (installed) return;
  installed = true;
  window.addEventListener("error", (e) => {
    log.error(`uncaught error: ${e.message}`, e.filename ? `at ${e.filename}:${e.lineno}` : "");
  });
  window.addEventListener("unhandledrejection", (e) => {
    log.error("unhandled promise rejection", safeJson(e.reason));
  });
}
