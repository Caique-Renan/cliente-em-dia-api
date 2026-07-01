"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotesRoutes = void 0;
const express_1 = require("express");
const quotes_controller_1 = require("./quotes.controller");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
exports.quotesRoutes = router;
// Todas as rotas de quotes requerem autenticação e empresa ativa
router.use(auth_1.requireAuth, auth_1.requireActiveCompany);
router.post('/', quotes_controller_1.quotesController.create);
router.get('/', quotes_controller_1.quotesController.list);
router.get('/:id', quotes_controller_1.quotesController.findById);
router.patch('/:id', quotes_controller_1.quotesController.update);
router.patch('/:id/status', quotes_controller_1.quotesController.updateStatus);
