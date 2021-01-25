import express from "express";

import * as rulesController from "./rule.controller";
import {createRulesValidation} from "./midlleware/rules.validation";

const routes = express.Router();

routes.post('/', createRulesValidation, rulesController.create)
routes.delete('/:id', rulesController.remove)
routes.get('/', rulesController.list)
routes.get('/between-dates', rulesController.ListRuleBetweenDates)


export default routes