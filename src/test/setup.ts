import { vi } from "vitest";

Object.defineProperty(window, "ethereum", {
  value: {
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  writable: true,
  configurable: true,
});
