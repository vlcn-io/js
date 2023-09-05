import winston from "winston";

let logger: winston.Logger;

export default {
  set logger(l: winston.Logger) {
    logger = l;
  },

  get logger() {
    return logger;
  },
};
