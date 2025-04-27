import express from 'express';

import { authenticateJWT } from '../controllers/auth.controller';
import {  meterReadingDisplayDetect,meterReadingWireQuality } from '../services/template/template.service';


const MeterReading = express.Router();

MeterReading.post('/metercount', authenticateJWT, meterReadingDisplayDetect);
MeterReading.post('/wireQuality',meterReadingWireQuality);
export default MeterReading;