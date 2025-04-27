import { Request, Response } from 'express';

import { createRolePermission, deleteRolePermission, getAllRolePermissions, getRole, getRolePermission, updateRolePermission } from "../../repository/role.repository";
import { createLogServiceBackend } from '../logs/log.service';

interface UserRequest extends Request {
    user?: {
        company?: string;
    }
}

export async function createRoleService(req: UserRequest, res: Response) {
    try {
        const data = req.body;
        if (!data) {
            await createLogServiceBackend(req, 200, "no data provided", "Roles and Permissions are required");
            return res.status(400).json({ message: 'No data provided' });
        }
        const orgId = req.user.company
        if (!orgId) {
            await createLogServiceBackend(req, 200, "fetching organization Id", "Roles and permissions");
        }
        data['company'] = orgId;
        const rolesandpermission = await createRolePermission(data);
        await createLogServiceBackend(req, 200, "successfully Created", "Roles and permissions");
        return res.status(200).json({ status: 'success', message: 'Role created successfully' });
    } catch (error) {
        await createLogServiceBackend(req, 500, "error in creating role and permission", "Roles and permissions");
        return res.status(500).json({ error });
    }
}

export async function getRoleById(Id: string) {
    try {
        const role = await getRole(Id);
        return { success: true, data: role };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function getAllRolesService(req: UserRequest, res: Response) {
    try {
        const { company } = req.user;
        let value = req.query.value as string || '';
        let sort = req.query.sort as string || null;
        let limit = req.query.limit as string || '10';
        let page = req.query.page as string || '1';
        const {roles, totalPages} = await getAllRolePermissions(value, company, sort, limit, page);
        // req.body.role = 'admin';
        // req.body.permission = ['canGetJobs', 'canGetTemplate', 'canCreateTemplate', 'canGetJobs', 'canGetTemplate', 'canCreateTemplate', 'canGetRoles', 'canCreateRoles', 'canGetDomain', 'canCreateDomain', 'canGetEkyc', 'canCreateEkyc', 'canGetUser', 'canCreateUser', 'canGetProject', 'canCreateProject'
        // ];
        const defaultRoles = {
            name: 'default',
            permissions: [
                'canGetJobs',
                'canGetTemplate',
                'canCreateTemplate',
                'canGetJobs',
                'canGetTemplate',
                'canCreateTemplate',
                'canGetRoles',
                'canCreateRoles',
                'canGetDomain',
                'canCreateDomain',
                'canGetEkyc',
                'canCreateEkyc',
                'canGetUser',
                'canCreateUser',
                'canGetProject',
                'canCreateProject',
            ],
        };
        const role = [defaultRoles, ...roles];
        await createLogServiceBackend(req, 200, "get all roles and permissions fetched", "RolesPermission");
        return res.status(200).send({data:role, totalPages:totalPages});
    } catch (error) {
        await createLogServiceBackend(req, 500, "error in catch block, Failed to get the roles and permission", "Jobs");
        return res.status(500).json({ error });
    }
}


export async function deleteRoleService(req: Request, res: Response) {
    try {

        const { id } = req.params;

        const Role = await getRole(id.toString());

        if (!Role) {
            return res.status(404).json({ status: 'error', message: 'Role not found' });
        }
        await deleteRolePermission(id);
        return res.status(200).json({ status: 'success', message: `Role has been deleted.` });

    } catch (error) {
        return res.status(500).json({ error });
    }
}

export async function updateRoleService(req: Request, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        const updates = req.body;

        //*check if the Role exists
        const role = await getRole(id.toString());
        if (!role) {
            await createLogServiceBackend(req, 404, "Unable to fetch roles and permissions", "RolePermission");
            return res.status(404).json({ status: 'error', message: `Role not found.` });
        }
        updates["updatedAt"] = new Date();
        // *Update the Role
        const updatedRole = await updateRolePermission(id, updates);
        await createLogServiceBackend(req, 200, "successfully updated the roles and permissions`{updatedRole}` ", "RolePermission");
        return res.status(200).json({ status: 'success', message: 'Role updated successfully' });
    } catch (error) {
        await createLogServiceBackend(req, 400, "Error in catch in roles and permissions`{updatedRole}` ", "RolePermission");
        return res.status(400).json({ message: 'Invalid role ID' });
    }
};



















// "canGetUser", "canCreateUser", "canDeleteUser", "canUpdateUser", "canGetProject", "canGetDashboard", "canGetScheduler", "canViewPageCount", "canGetRole", "PRY", "eKYC", "canSaveTemplate", "canEditTemplate", "canSendTemplateForApproval", "canGetJob", "canCreateJob", "canEditJob", "canCreateProject", "canEditProject", "canCreateEkycWorkflow", "canUpdateEkycWorkflow", "canDeleteEkycWorkflow", "canGetEkycWorkflow", "canGetEkyc", "canCreateEkyc", "canDeleteEkyc", "canUpdateEkyc", "canGetTemplate", "canDeleteTemplate", "canCreateTemplate", "canUpdateTemplate"