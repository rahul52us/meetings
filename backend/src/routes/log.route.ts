import express from 'express';

import { authenticateJWT } from '../controllers/auth.controller';

import { createLogService, getLogService } from '../services/logs/log.service';

const Logs = express.Router();

Logs.post('/create', authenticateJWT, createLogService)

Logs.get('/get', authenticateJWT, getLogService)

export default Logs;