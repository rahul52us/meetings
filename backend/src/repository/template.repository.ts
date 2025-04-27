import Template, { ITemplate } from "./schemas/template.schema";
import { Schema } from "mongoose";

export type TemplateData = {
  _id?: string;
  name: string;
  domain: string;
  company?: string;
  engine: string;
  sample: string;
  identifier: string;
  comments: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export async function createTemplate(
  templateData: ITemplate
): Promise<Schema.Types.ObjectId | Error> {
  try {
    if (!templateData) {
      throw new Error("TemplateData is required");
    }
    const template = Template.create(new Template(templateData));
    if (!template) {
      throw new Error("Template creation failed");
    }
    console.log(templateData);
    const template_id = (await template)._id;
    return template_id;
  } catch (error) {
    // console.log(error);
    return error;
  }
}

export async function updatetemplate(id: string, data: Partial<TemplateData>) {
  try {
    // console.log(id, updates);
    if (!id) {
      throw new Error("Template id is required");
    }
    const result = await Template.updateOne({ _id: id }, { $set: data });
    return result;
  } catch (error) {
    return error;
  }
}

export async function getalltemplates(
  searchValue: string,
  company: string,
  approval: boolean,
  userId: string,
  sort: string | null = "1",
  page: string | null = "1",
  limit: string | null = "10"
) {
  try {
    let approvalPipeline = approval
      ? {
          status: "Pending Approval",
        }
      : {};
    // let infiniteScroll: any = [];
    let pipeline = [
      {
        $match: {
          name: { $regex: searchValue, $options: "i" },
          deletedAt: { $exists: false },
          company: company,
          user: userId,
          ...approvalPipeline,
        },
      },
      // ...infiniteScroll,
    ];
    if (limit && page) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      pipeline.push(
        // { $sort: { [sort]: 1 } } as any,
        { $skip: skip } as any,
        { $limit: parseInt(limit) } as any
      );
    }

    const [template, totalCount] = await Promise.all([
      Template.aggregate(pipeline),
      Template.countDocuments({
        deletedAt: { $exists: false },
      }),
    ]);

    let totalPages = 1;
    if (limit) {
      totalPages = Math.ceil(totalCount / parseInt(limit));
    }

    return {
      data: template,
      totalPages,
    };
  } catch (error) {
    return new Error(error);
  }
}
export async function getalltemplate(
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
    let pipeline = [
      {
        $match: {
          name: { $regex: searchValue, $options: "i" },
          deletedAt: { $exists: false },
          company: company,
          ...idSearch,
        },
      },
    ];
    const templates = await Template.aggregate(pipeline);
    return templates;
  } catch (error) {
    return new Error(error);
  }
}

export async function gettemplate(id: string): Promise<ITemplate> {
  try {
    const template = await Template.findOne({ _id: id });
    return template;
  } catch (error) {
    return error;
  }
}
