"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("../modules/auth/auth.route"));
const transcribe_route_1 = __importDefault(require("../modules/transcribe/transcribe.route"));
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_route_1.default
    },
    {
        path: '/transcribe',
        route: transcribe_route_1.default
    }
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
