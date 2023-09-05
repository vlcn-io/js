import winston from "winston";

let loggerInternal: winston.Logger;

const loggerProvider = {
  set logger(l: winston.Logger) {
    loggerInternal = l;
  },

  get logger() {
    if (loggerInternal == null) {
      console.warn("No logger set! Using default logger.");
      loggerInternal = winston.createLogger({
        level: "info",
        format: winston.format.json(),
        defaultMeta: { service: "ws-server" },
        transports: [
          //
          // - Write all logs with importance level of `error` or less to `error.log`
          // - Write all logs with importance level of `info` or less to `combined.log`
          //
          // new winston.transports.File({ filename: 'error.log', level: 'error' }),
          // new winston.transports.File({ filename: 'combined.log' }),
          new winston.transports.Console({
            format: winston.format.simple(),
          }),
        ],
      });
    }
    return loggerInternal;
  },
};

export const logger = loggerProvider.logger;

export default loggerProvider;
