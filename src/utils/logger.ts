import pino from "pino";
import pinoHttp from "pino-http";

const isDev = process.env.NODE_ENV !== "production";

const loggerConfig = isDev
  ? {
      level: process.env.LOG_LEVEL || "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: false,
          translateTime: "SYS:standard",
        },
      },
    }
  : {
      level: process.env.LOG_LEVEL || "info",
    };

export const logger = pino(loggerConfig);

export const pinoHttpMiddleware = pinoHttp.default({
  logger,
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.remoteAddress,
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
      headers: res.headers,
    }),
  },
});
