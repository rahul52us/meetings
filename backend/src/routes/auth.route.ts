import express from 'express';

import auth from 'express-basic-auth'

import { registerAdmin, loginUser, forgotPasswordUser, verifyEmail, resetPasswordUser } from '../services/authentication';

const basic = auth({
    users: { 'admin': 'abc12345' },
    challenge: true,
    realm: "Signup Login."
});

const Auth= express.Router();

Auth.post('/signup', registerAdmin)

Auth.post('/login', loginUser);

Auth.post('/forgotPassword', forgotPasswordUser)

Auth.get('/verifyEmail', verifyEmail);

Auth.post('/resetPassword', resetPasswordUser)


export default Auth;