import Role, { IRole } from './schemas/role.schema';
import mongoose from 'mongoose';
/* export type RolePermissionData = {
    permissions: string;
    roleId?: number,
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
} */
export { IRole }
export async function createRolePermission(data: IRole): Promise<mongoose.Types.ObjectId | Error> {
    try {
        const rolePermission = Role.create(new Role({
            name: data.name,
            permissions: data.permissions,
            company: data.company,
            template: data.template,
            createdAt: new Date()
        }));
        // console.log(rolePermission)
        const rolePermissionId = (await rolePermission)._id
        return rolePermissionId;
    } catch (err) {
        return new Error(err);
    }
}

export async function updateRolePermission(id: string, data: Partial<IRole>) {
    try {
        // const result = await Roles.updateOne({ _id: id }, { $set: updates });
        const result = await Role.updateOne({ _id: id }, { $set: data });
        // console.log(result);
        // console.log(results);
        return result;
    } catch (err) {
        console.log(err);
        return err;
    }
}

export async function getRole(id: string) {
    try {
        const jobs = await Role.findById(id);
        return jobs;
    } catch (error) {
        return new Error(error);
    }
}



export async function deleteRolePermission(id: string) {
    try {
        const result = await Role.updateOne({ _id: id }, { $set: { deletedAt: new Date() } });
        return result;
    } catch (err) {
        console.log(err);
        return err;
    }
}

export async function getRolePermission(id: string) {
    const pipeline = [
        {
            '$match': {
                '_id': new mongoose.Types.ObjectId(id)
            }
        }, {
            '$project': {
                'role': 1,
                'permissions': 1,
                'deletedAt': 1
            }
        }, {
            '$match': {
                'deletedAt': { '$exists': false }
            }
        }
    ];

    return Role.aggregate(pipeline)
        .exec()
        .then((result: string | any[]) => {
            if (result.length === 0) {
                throw new Error(`RolePermission with id ${id} not found`);
            }
            return result[0];
        });
}
export async function getAllRolePermissions(searchValue: string, company: string, sort: string | null = "1", limit: string | null = "10",page: string | null = "1") {
    try{
    // let infiniteScroll: any = [];
    
    const pipeline = [
        {
            '$match': {
                "name": { '$regex': searchValue, '$options': 'i' },
                'deletedAt': { '$exists': false },
                'company': company
            },
            // ...infiniteScroll
        }
    ];
    if (limit && page) {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push(
          // { $sort: { [sort]: 1 } } as any,
          { $skip: skip } as any,
          { $limit: parseInt(limit) } as any
        );
      }

      const [role, totalCount] = await Promise.all([
        Role.aggregate(pipeline),
        Role.countDocuments({
          deletedAt: { $exists: false },
        }),
      ]);

      let totalPages = 1;
      if (limit) {
        totalPages = Math.ceil(totalCount / parseInt(limit));
      }
      console.log(totalPages)
      return {
        roles: role,
        totalPages,
      };

    // return Role.aggregate(pipeline)
    //     .exec()
    //     .then((result) => {
    //         return result;
    //     }).catch((err) => {
    //         console.log(err);
    //         return err
    //     });

} catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
}

// export async function getRole(id: string) {
//     const pipeline = [
//       {
//         '$match': {
//           '_id': new Types.ObjectId(id)
//         }
//       },
//       {
//         '$project': {
//           'name': 1,
//           'permissions': 1,
//           'createdAt': 1,
//           'updatedAt': 1,
//           'deletedAt': 1
//         }
//       },
//       {
//         '$match': {
//           'deletedAt': { '$exists': false }
//         }
//       }
//     ];
//     return RolePermission.aggregate<IRole>(pipeline)
//       .exec()
//       .then((result) => {
//         if (result.length === 0) {
//           return new Error(`Role with id ${id} not found`);
//         }
//         return result[0];
//       }).catch((err) => {return err});
//   }