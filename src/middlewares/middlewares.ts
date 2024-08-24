import { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";

export const contentType = (req: Request, res: Response, next: NextFunction): void => {
  res.type("json");
  next();
};

export default (app: Express): void => {
  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:5173",
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      // preflightContinue: true,
      // allowedHeaders: [
      //   "Content-Type",
      //   "Authorization",
      //   "Content-Length",
      //   "X-Requested-With",
      //   "Origin",
      //   "Accept",
      //   "x-access-token",
      //   "x-app",
      // ],
      // optionsSuccessStatus: 200,
      // maxAge: 864000,
    })
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(contentType);
  app.options("/.*/", (req, res, next) => {
    res.send(200);

    return next();
  });
};
