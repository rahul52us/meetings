import express, { Request, Response, NextFunction, Router } from 'express';
import { authenticateJWT } from '../controllers/auth.controller';
import { createAccountService, getAccountService } from '../services/statments/accountdetails.service';
// import { createAccountService, getAccountService } from '~/services/statement/accountdetails.service';

const AccountDetails = express.Router();

AccountDetails.post('/create', authenticateJWT, createAccountService)
AccountDetails.get('/get', authenticateJWT, getAccountService)


export default AccountDetails;