import express from 'express';

import { authenticateJWT } from '../controllers/auth.controller';
import {  StampDetection } from '../services/template/template.service';

const Stamp = express.Router();

Stamp.post('/detection', authenticateJWT, StampDetection);
export default Stamp;