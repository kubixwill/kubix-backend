"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
// Ghost Content API configuration (no explicit version; site responds at /content)
const GHOST_API_BASE_URL = process.env.GHOST_API_URL?.trim() || "https://kubix.ghost.io/ghost/api/content";
const GHOST_CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY?.trim() || "13e5c1c8586bfab9cd630b1704";
router.get('/posts', async (req, res) => {
    try {
        const { page, limit, tag, include } = req.query;
        const response = await axios_1.default.get(`${GHOST_API_BASE_URL}/posts/`, {
            params: {
                key: GHOST_CONTENT_API_KEY,
                include: include || 'authors,tags',
                limit: limit || '10',
                page: page || '1',
                ...(tag ? { filter: `tag:${tag}` } : {})
            }
        });
        res.status(200).json(response.data);
    }
    catch (error) {
        const status = error?.response?.status || 500;
        const data = error?.response?.data || { message: error.message };
        console.error('Ghost posts fetch failed', data);
        res.status(status).json({ error: 'Failed to fetch Ghost posts', details: data });
    }
});
exports.default = router;
