import { Application, Router } from "express";
import { userRoutes } from "../routes/user.route.js";

type RouteConfig = {
  path: string;
  router: Router;
};

const resourceRoutes: RouteConfig[] = [{ path: "/users", router: userRoutes }];

export const registerRoutes = (app: Application) => {
  const apiRouter = Router();

  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
  });

  apiRouter.get("/docs", (req, res) => {
    res.json({ message: "API documentation" });
  });

  resourceRoutes.forEach(({ path, router }) => {
    apiRouter.use(path, router);
    console.log(`🔗 Route registered: ${path}`);
  });

  app.use("/api", apiRouter);
};
