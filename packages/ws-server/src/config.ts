export const defaultConfig: Config = Object.freeze({
  dbFolder: "./dbs",
  schemaFolder: "./schemas",
  pathPattern: /\/vlcn-ws/,
  appName: "fix-me",
  notifyLatencyMs: 50,
});

export type Config = Readonly<{
  dbFolder: string | null;
  schemaFolder: string;
  pathPattern: RegExp;
  appName?: string;
  notifyLatencyMs?: number;
  notifyPat?: string;
  notifyPolling?: boolean;
}>;
