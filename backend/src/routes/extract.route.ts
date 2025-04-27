import express from 'express';
import {saveExtractedService, getExtractedService, ExtractDataService} from '../services/extracted/extracted.service';

const Extract = express.Router();

Extract.get('/get', getExtractedService);

Extract.post('/save', saveExtractedService);

Extract.post('/extract', ExtractDataService);

export default Extract;