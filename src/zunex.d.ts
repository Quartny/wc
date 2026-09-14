type ZunexConfig = { inBuild?: 'on' | 'off' };
type ZunexRuntime = {
  conf?: { get: () => ZunexConfig; set: (config: ZunexConfig) => void };
  inBuildProvider?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
};

declare global {
  interface Window { Zunex?: ZunexRuntime; }
}

export {};
