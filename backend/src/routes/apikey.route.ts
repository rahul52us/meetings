import express from 'express';
import { checkApiKey } from '../controllers/apikey/key.controller';

import { authenticateJWT } from '../controllers/auth.controller';

import { createApiKeyService, getAllApiKeySerivce, deleteApiKeyService, updateApiKeyService } from '../services/apikey/apikey.service';

const ApiKey = express.Router();

/*  all routes for apiKey services   */

ApiKey.post('/create', authenticateJWT, createApiKeyService)     //* authenticateJWT, grantAccess('canCreateUser', 'Jobs'),
ApiKey.get('/get', authenticateJWT, getAllApiKeySerivce)
ApiKey.delete('/delete/:id', authenticateJWT, deleteApiKeyService)
ApiKey.put('/update/:id', authenticateJWT, updateApiKeyService)  //authenticateJWT, grantAccess('updateAny', 'Jobs'),
ApiKey.post('/matchkey/:key', checkApiKey)  //authenticateJWT, grantAccess('updateAny', 'Jobs'),
export default ApiKey;