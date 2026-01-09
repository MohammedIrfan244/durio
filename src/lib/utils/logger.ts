// lib/logger.ts

type LogData = unknown;

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";

export function info(message: string, data?: LogData) {
  console.log(
    `${CYAN}${BOLD}[INFO]${RESET} ${message}`,
    data !== undefined ? data : ""
  );
}

export function error(message: string, data?: LogData) {
  console.error(
    `${RED}${BOLD}[ERROR]${RESET} ${message}`,
    data !== undefined ? data : ""
  );
}

export function warn(message: string, data?: LogData) {
  console.warn(
    `${YELLOW}${BOLD}[WARN]${RESET} ${message}`,
    data !== undefined ? data : ""
  );
}

export function success(message: string, data?: LogData) {
  console.log(
    `${GREEN}${BOLD}[SUCCESS]${RESET} ${message}`,
    data !== undefined ? data : ""
  );
}
