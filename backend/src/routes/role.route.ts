import express, { Request, Response, NextFunction, Router } from 'express';

import { authenticateJWT } from '../controllers/auth.controller';
import { grantAccess } from '../controllers/rbac/rbac.controller'


import { createRoleService, getAllRolesService, getRoleById, deleteRoleService, updateRoleService } from '../services/roles/role.services';

const Roles = express.Router();

Roles.post('/create', authenticateJWT, grantAccess('create', 'roles'), createRoleService)  // grantAccess('create', 'roles'),
Roles.get('/get', authenticateJWT, grantAccess('get', 'roles'), getAllRolesService)  // grantAccess('get', 'roles')
// Roles.get('/get/:id', authenticateJWT, grantAccess('get', 'roles'), getRoleById)
Roles.delete('/delete/:id', grantAccess('delete', 'roles'), authenticateJWT, deleteRoleService)
Roles.put('/update/:id', authenticateJWT, grantAccess('update', 'roles'), updateRoleService)

export default Roles;