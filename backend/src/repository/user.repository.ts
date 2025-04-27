import Account from "./schemas/accounts.schema";
import Tokens from "./schemas/tokens.schema";
import mongoose, { Schema, Document, Types } from "mongoose";

export const usersColumns = {
  id: "users.id",
  name: "users.name",
  email: "users.email",
  createAt: "users.created_at",
  updatedAt: "users.updated_at",
  isActive: "users.is_active",
  position: "users.position",
  company: "users.company",
  avatarUrl: "users.avatar_url",
  provider: "users.provider",
  providerId: "users.provider_id",
  deletedAt: "users.deleted_at",
};

type FindUserProps = {
  id?: string;
  email?: string;
  deleted_at?: string;
  moNumber?: Number;
};

export type UserProfile = {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  companyName?: string;
  is_active?: boolean;
  role?: string;
  permission?: any;
  company: any;
  moNumber?: string;
  deletedAt?: Date;
};
export async function findUser({ id, email, moNumber }: FindUserProps) {
  let search: any = { $and: [{ deletedAt: { $exists: false } }] };

  if (id) search.$and.push({ _id: new mongoose.Types.ObjectId(id) });
  if (email) search.$and.push({ username: email });
  if (moNumber) search.$and.push({ moNumber: moNumber });
  return Account.findOne(search);
}

// find user in mongodb in Accounts collection
/**
 * @param  {} {id
 * @param  {} email
 * @param  {} provider_id
 * @param  {} provider
 * @param {string} mobileNumber
 * @param  {FindUserProps} deleted_at=null}
 */
export async function fidUser({ id, email, moNumber }: FindUserProps) {
  // let search = {}
  let search: any = { deletedAt: { $exists: false } };
  if (id) search = { _id: new mongoose.Types.ObjectId(id) };
  if (email) search = { username: email };
  if (moNumber) search = { ...search, moNumber: moNumber };

  return Account.findOne(search);
}

// create user in mongodb in Accounts collection
/**
 * @param  {UserProfile} userData
 * @returns Promise
 */
export async function createUser(
  userData: UserProfile
): Promise<Schema.Types.ObjectId | Error> {
  try {
    const user = await Account.register(
      new Account({
        name: userData.name,
        username: userData.email,
        companyName: userData.companyName,
        moNumber: userData.moNumber,
        role: userData.role || "user",
        permission: userData.permission || [],
        company: userData?.company,
      }),
      userData.password
    );
    const userId = user._id.toString();
    // console.log(user);
    return userId;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
}

// update user profile in mongodb in Accounts collection
/**
 * @param  {string} id
 * @param  {UserProfile} data
 */
export async function updateUser(id: string, data: UserProfile) {
  try {
    const user = await Account.updateOne({ _id: id }, { $set: data });
    return user;
  } catch (error) {
    return new Error(error);
  }
}

//update usertoken in mongodb in Tokens collection
/**
 * @param  {string} id
 * @param  {'verify_email'|'forgot_password'|'team_invitation_email'} type
 */
export async function getUserByIdAndJoinUserToken(
  id: string,
  type: "verify_email" | "forgot_password" | "team_invitation_email"
) {
  try {
    const session = await Tokens.findOneAndUpdate(
      { user_id: new mongoose.Types.ObjectId(id) },
      { $set: { type } }
    );
    return session;
  } catch (err) {
    return err;
  }
}

// active user in mongodb in Accounts collection
/**
 * @param  {string} id
 */
export async function activeUser(id: string) {
  try {
    const user = await Account.findByIdAndUpdate(id, { is_active: true });
    return user;
  } catch (error) {
    return new Error(error);
  }
}

export async function getUserData() {
  try {
    const pipeline: any = [
      {
        $match: {
          is_active: true,
        },
      },
      {
        $project : {
          name : 1,
          username : 1,
          role : 1,
          company:1,
          _id : 1,
          moNumber:1,
          permission:1,
          is_active : 1

        }
      }
    ];

    const accountData = await Account.aggregate(pipeline);
    return accountData;
  } catch (err) {
    throw new Error(err);
  }
}

export async function getUserAccountDetails(id: string) {
  try {
    const accountData = await Account.findById(id);
    if (accountData) {
      const { _id, ...rest } = accountData.toObject();
      return rest;
    } else {
      return new Error("User does not exists");
    }
  } catch (err) {
    throw new Error(err);
  }
}

export async function getPermissions(id: string) {
  try {
    const pipeline = [
      {
        $match: {
          _id: id,
        },
      },
      {
        $project: {
          permission: 1,
          _id: 0,
        },
      },
    ];
    return Account.aggregate(pipeline)
      .exec()
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return new Error(err);
      });
    /* const projection = { '_id': 1, 'name': 1, 'username': 1, 'role': 1, 'permission': 1 };
    const users = await Account.find({}, projection) as any;
    return users; */
  } catch (error) {
    return new Error(error);
  }
}

export async function findUserProps(id: string): Promise<any> {
  try {
    const user = await Account.findById(id);
    return user;
  } catch (error) {
    return error;
  }
}
export async function getallusers(
  id: any,
  searchValue: string,
  company: string,
  sort: string | null = "1",
  page: string | null = "1",
  limit: string | null = "10",
  req: any
) {
  try {
    // let infiniteScroll: any = [];
    // if (sort && skip && limit) {
    //   infiniteScroll = [
    //     { $sort: Number(sort) },
    //     { $skip: Number(skip) },
    //     { $limit: Number(limit) },
    //   ];
    // }
    const pipeline: any = [
      {
        $match: {
          _id: { $not: { $eq: id } },
          name: { $regex: searchValue, $options: "i" },
          deletedAt: { $exists: false },
          company: company,
        },
      },
      {
        $project: {
          salt: 0,
          hash: 0,
          deletedAt: 0,
          __v: 0,
        },
      },
      // ...infiniteScroll,
    ];

    if (req.query.filter && req.query.filter === "recentlyAdded") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      pipeline.unshift({
        $match: {
          created_At: { $gte: oneWeekAgo },
        },
      });
    }

    if (limit && page) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      pipeline.push(
        // { $sort: { [sort]: 1 } } as any,
        { $skip: skip } as any,
        { $limit: parseInt(limit) } as any
      );
    }

    const [userData, totalCount] = await Promise.all([
      Account.aggregate(pipeline),
      Account.countDocuments({
        deletedAt: { $exists: false },
      }),
    ]);

    let totalPages = 1;
    if (limit) {
      totalPages = Math.ceil(totalCount / parseInt(limit));
    }

    return {
      data: userData,
      totalPages,
    };
  } catch (error) {
    return new Error(error);
  }
}
export async function getalluser(
  searchValue: string,
  company: string,
  user: string,
  role: string
) {
  try {
    let idSearch: object = { user: user };
    if (role === "admin") {
      idSearch = { company: company };
    }
    const pipeline = [
      {
        $match: {
          // '_id': { $not: { $eq: id } },
          name: { $regex: searchValue, $options: "i" },
          deletedAt: { $exists: false },
          company: company,
          ...idSearch,
        },
      },
      {
        $project: {
          salt: 0,
          hash: 0,
          deletedAt: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
    ];

    return Account.aggregate(pipeline)
      .exec()
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return new Error(err);
      });
  } catch (error) {
    return new Error(error);
  }
}

export async function deleteUserById(id: string) {
  try {
    const result = await Account.updateOne(
      { _id: id },
      { $set: { deletedAt: new Date() } }
    );
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
}

export async function getUser(id: string) {
  const pipeline = [
    {
      $match: {
        _id: new Types.ObjectId(id),
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        mobileNumber: 1,
        deletedAt: 1,
      },
    },
    {
      $match: {
        deletedAt: { $exists: false },
      },
    },
  ];

  return Account.aggregate(pipeline)
    .exec()
    .then((result) => {
      if (result.length === 0) {
        return new Error(`User with id ${id} not found`);
      }
      return result[0];
    })
    .catch((err) => {
      return err;
    });
}
