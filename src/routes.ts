import express from "express";

import rulesRoutes from "./rules/rule.routes";

const routes = express.Router();

routes.use('/test-api', async (req, res) => res.json({message: "Pronto!!"}).send())
routes.use('/rules', rulesRoutes)

export {routes}