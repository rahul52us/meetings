import mongoose from "mongoose";
import PdfDetail, { IPdf } from "../repository/schemas/pdfdetails.schema";
import { Folder, IFolder } from "./schemas/Folder.schema";
// Function to create a new PDF detail document
const { v4: uuidv4 } = require("uuid");

function generateShortId() {
  const uuid = uuidv4();
  const shortId = uuid.replace(/-/g, "").slice(0, 5);
  return shortId;
}

export async function findFolderById(data: any) {
  try {
    const folderData = await Folder.findById(data._id);
    if (folderData) {
      return {
        status: "success",
        data: folderData,
      };
    } else {
      return {
        status: "error",
        data: "No Such Record Exists",
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
    };
  }
}

export async function findFolderByIdAndUpdate(data: any) {
  try {
    const folderData = await Folder.findByIdAndUpdate(data._id, {
      $set: { totalPages: data.totalPages },
    });
    if (folderData) {
      return {
        status: "success",
        data: folderData,
      };
    } else {
      return {
        status: "error",
        data: "No Such Record Exists",
      };
    }
  } catch (err: any) {
    return {
      status: "error",
      data: err?.message,
    };
  }
}

export async function createFolder(data: IFolder, user: any) {
  try {
    const shortId = generateShortId();
    data["folderId"] = `FL-${shortId}`;
    data["user"] = user;
    const folderDetail = new Folder(data);
    const savedData = await folderDetail.save();
    return savedData;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getFolderDetails(
  filter: any,
  page: string,
  limit: string | null = "10",
  getTotal: boolean,
  role?: string,
  userId?: any,
  company?: any
) {
  try {
    const datass = await Folder.find({ deletedAt: { $exists: false } });

    const pipeline: any = [];
    const matchConditions: any = {
      $match: {
        deletedAt: { $exists: false },
        // ...filter, // Apply any additional filters (e.g., search terms)
      },
    };

    pipeline.push(matchConditions);

    if (role === "user") {
      pipeline.push({
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      });
    } else if (role === "admin") {
      pipeline.push(
        {
          $lookup: {
            from: "accounts",
            localField: "user",
            foreignField: "_id",
            as: "accountInfo",
          },
        },
        {
          $unwind: "$accountInfo",
        },
        {
          $match: {
            "accountInfo.company": company,
          },
        }
      );
    }

    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });

    const totalCountPipeline = [...pipeline];

    let totalData = []
    if (getTotal) {
      totalData = await Folder.aggregate(totalCountPipeline)
    }

    if (limit && page) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      pipeline.push({ $skip: skip } as any, { $limit: parseInt(limit) } as any);
    }

    const datas = await Folder.aggregate(pipeline);

    const totalCountResult = await Folder.aggregate([
      ...totalCountPipeline,
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);
    const totalCount =
      totalCountResult.length > 0 ? totalCountResult[0].count : 0;

    let totalPages = 1;
    if (limit) {
      totalPages = Math.ceil(totalCount / parseInt(limit));
    }
    return {
      status: "success",
      data: datas,
      totalData: totalData,
      totalPages,
      statusCode: 200,
    };
  } catch (err) {
    return {
      status: "error",
      data: err?.message,
      statusCode: 500,
    };
  }
}

export async function createPdfDetail(data: IPdf): Promise<IPdf | Error> {
  try {
    const shortId = generateShortId();
    data["pdf_Id"] = `DOC-${shortId}`;
    const pdfDetail = new PdfDetail(data);
    const savedData = await pdfDetail.save();
    return savedData;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function updatePdfDetailExtractedDetails(data: any) {
  try {
    const pdfData = await PdfDetail.findById(data?.id)
    const {id, ...rest} = data
    if(pdfData){
      pdfData.extractedData = {...rest}
      await pdfData.save()
      return {
        status : 'success',
        data : pdfData
      }
    }
    else {
      return {
        status : 'error',
        data : 'Document not found'
      }
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function updatePdfDetail(data: any) {
  try {
    const pdf = await PdfDetail.findById(data.id);
    if (pdf) {
      pdf.workflowInfo = data?.workflowInfo || {};
      pdf.comment = data?.data?.data?.comment || pdf.comment;
      pdf.status = data?.data?.data?.status || pdf.status;
      pdf.indexing = data?.data?.data?.indexing || pdf.indexing;
      pdf.isExtracted = data?.data?.data?.isExtracted;
      if (data?.data?.data?.Approved_At) {
        pdf.approved_At = data?.data?.data?.Approved_At;
      }
      if (data?.data?.data?.extractedData) {
        pdf.extractedData = data?.data?.data?.extractedData;
      }
      await pdf.save();
      return pdf;
    } else {
      throw new Error("document does not exists");
    }
  } catch (err) {
    throw new Error(err.message);
  }
}
export async function updateWorkflowStatus(data: any) {
  try {
    const pdf = await PdfDetail.findById(data.id);
    if (pdf) {
      pdf.workflowStatus.push({
        level: data?.data?.level,
        status: data?.data?.workflowStatus,
        comment: data?.data?.comment,
        type: data?.data?.status === "extraction" ? "extraction" : "approval",
      });

      await pdf.save();
      return pdf;
    } else {
      throw new Error("document does not exist");
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function updatePdfStatus(data: any) {
  try {
    const pdf = await PdfDetail.findById(data.id);
    if (pdf) {
      pdf.workflowInfo = data?.data?.workflowInfo || pdf.workflowInfo;
      pdf.comment = data?.data?.comment || pdf.comment;
      pdf.status = data?.data?.status || pdf.status;
      pdf.indexing = data?.data?.indexing || pdf.indexing;
      pdf.isExtracted = data?.data?.isExtracted || pdf.isExtracted;
      pdf.approved_At = data?.data?.Approved_At || pdf.approved_At;
      pdf.extractedData = data?.data?.extractedData || pdf.extractedData;
      if (data?.data?.status === "extraction") {
        pdf.flowDates.extractionApproval = new Date();
      } else if (data?.data?.status === "extracted") {
        pdf.flowDates.extracted_At = new Date();
      } else if (data?.data?.status === "approved") {
        pdf.flowDates.approved_At = new Date();
      }
      if (data?.data?.extractedData) {
        pdf.extractedData = data?.data?.extractedData;
      }

      await pdf.save();
      return pdf;
    } else {
      throw new Error("document does not exists");
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getPdfDetailById(data: any) {
  try {
    const pdf = await PdfDetail.findById(data.id);
    if (pdf) {
      return pdf;
    } else {
      throw new Error("document does not exists");
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

// retrieve a PDF detail document by ID
export async function getPdfDetails(data: any) {
  const page = data.page;
  const limit = data.limit;
  const company = data?.company;
  const pipeline: any[] = [];

  let matchConditions: any = {};

  pipeline.push({
    $match: {
      ...matchConditions,
      folderId : data.folderId,
      deletedAt: { $exists: false }
    },
  });


    pipeline.push(
      {
        $lookup: {
          from: "accounts",
          localField: "user",
          foreignField: "_id",
          as: "accountInfo",
        },
      },
      {
        $unwind: "$accountInfo",
      },
      {
        $match: {
          "accountInfo.company": company,
        },
      }
    );

  if (data.search && data.search.trim()) {
    const searchRegex = new RegExp(data.search.trim(), "i");
    pipeline.push({
      $match: {
        $or: [
          { pdf_Id: { $regex: searchRegex } },
        ],
      },
    });
  }

  // Group by document ID
  pipeline.push({
    $group: {
      _id: "$_id",
      document: { $first: "$$ROOT" },
      matchedPages: {
        $addToSet: "$extractedData.results.matchedPage",
      },
    },
  });


  // Lookup to populate 'files' field
  pipeline.push({
    $lookup: {
      from: "fs.files",
      localField: "document.files.file",
      foreignField: "_id",
      as: "document.files.file",
    },
  });

  pipeline.push({
    $lookup: {
      from: "folders",
      localField: "document.folderId",
      foreignField: "_id",
      as: "folderDetails",
    },
  });

  // Replace the root document with the modified structure
  pipeline.push(
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$document",
            { folderDetails: { $arrayElemAt: ["$folderDetails", 0] } },
          ],
        },
      },
    },
    {
      $sort: {
        created_At: -1,
      },
    }
  );

  try {
    let countPipeline = [
      ...pipeline,
      { $group: { _id: null, count: { $sum: 1 } } },
    ];
    if (limit && page) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      pipeline.push({ $skip: skip } as any, { $limit: parseInt(limit) } as any);
    }

    const [pendingData, totalCount]: any = await Promise.all([
      PdfDetail.aggregate(pipeline),
      PdfDetail.aggregate(countPipeline),
    ]);


    let totalPages;
    if (limit) {
      totalPages = Math.ceil(totalCount?.[0]?.count / parseInt(limit));
    }

    return {
      status: "success",
      data: { data: pendingData, totalPages: totalPages },
      statusCode: 200,
    };
  } catch (err) {
    return {
      status: "error",
      data: err?.message,
      statusCode: 500,
    };
  }
}

export async function getExtractedPdfDetails(data: any) {
  try {
    const pipeline: any = [];

    if (data.folderId) {
      pipeline.push({
        $match: {
          folderId: data.folderId,
          deletedAt: { $exists: false },
          isExtracted: true,
          // "isApproved":true
        },
      });
    } else {
      pipeline.push({
        $match: {
          deletedAt: { $exists: false },
          isExtracted: true,
          // "isApproved":true
        },
      });
    }

    pipeline.push(
      {
        $unwind: "$files",
      },
      {
        $lookup: {
          from: "fs.files",
          localField: "files.file",
          foreignField: "_id",
          as: "files.file",
        },
      },
      {
        $lookup: {
          from: "folders",
          localField: "folderId",
          foreignField: "_id",
          as: "folderDetails",
        },
      },
      {
        $unwind: "$folderDetails",
      },
      {
        $match: {
          "folderDetails.deletedAt": { $exists: false },
        },
      },
      {
        $sort: {
          created_At: -1,
        },
      }
    );
    const datas = await PdfDetail.aggregate(pipeline);
    return {
      status: "success",
      data: datas,
      statusCode: 200,
    };
  } catch (error) {
    throw new Error("Error in getting Extracted files");
  }
}

export async function deleteFolder(id: string) {
  try {
    const deletedFolder = await Folder.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date() },
    });
    return deletedFolder;
  } catch (error) {
    throw new Error("Error deleting the folder");
  }
}

export async function deleteFile(id: string) {
  try {
    const deletedFolder = await PdfDetail.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date() },
    });
    if (deletedFolder.status === "pending") {
      await deletedFolder.delete();
    }
    return deletedFolder;
  } catch (error) {
    throw new Error("Error deleting the folder");
  }
}

export async function getTotalPdfRepo(
  startDate: any,
  endDate: any,
  user: any,
  role: any,
  company: any
) {
  try {
    // Ensure endDate is set to the end of the day (23:59:59)
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    adjustedEndDate.setHours(0, 0, 0, 0);

    const pipeline: any[] = [];
    pipeline.push(
      {
        $lookup: {
          from: "folders",
          localField: "folderId",
          foreignField: "_id",
          as: "folder",
        },
      },
      {
        $unwind: "$folder",
      },
      {
        $match: {
          "folder.deletedAt": { $exists: false },
        },
      }
    );

    if (role === "user") {
      pipeline.push({
        $match: {
          "folder.user": new mongoose.Types.ObjectId(user),
        },
      });
    } else if (role === "admin") {
      pipeline.push(
        {
          $lookup: {
            from: "accounts",
            localField: "user",
            foreignField: "_id",
            as: "accountInfo",
          },
        },
        {
          $unwind: "$accountInfo",
        },
        {
          $match: {
            "accountInfo.company": company,
          },
        }
      );
    }

    pipeline.push(
      {
        $match: {
          created_At: {
            $gte: new Date(startDate),
            $lt: adjustedEndDate,
          },
          deletedAt: { $exists: false },
        },
      },
      {
        $group: {
          _id: null,
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          approvedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
            },
          },
          extractdPdfCount: {
            $sum: {
              $cond: [{ $eq: ["$isExtracted", true] }, 1, 0],
            },
          },
        },
      }
    );

    const result = await PdfDetail.aggregate(pipeline);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    throw new Error("Error getting the total pdf Count");
  }
}

export async function getPdfCreationChart() {
  try {
    let nonZeroDays: any[] = [];
    let daysBack = 30; // Start with the last 30 days
    const today = new Date(); // Current date

    while (nonZeroDays.length < 7) {
      const referenceDate = new Date();
      referenceDate.setDate(today.getDate() - daysBack); // Go back `daysBack` days

      // Fetch data for the last `daysBack` days
      const pipeline: any[] = [
        {
          $match: {
            created_At: {
              $gte: referenceDate, // Starting from `daysBack` days ago
              $lt: today, // Up to today
            },
          },
        },
        {
          $addFields: {
            createdAtDay: {
              $dateToString: { format: "%Y-%m-%d", date: "$created_At" },
            },
          },
        },
        {
          $group: {
            _id: "$createdAtDay", // Group by day
            count: { $sum: 1 }, // Count PDFs created on that day
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date in ascending order
        },
        {
          $project: {
            _id: 0,
            date: "$_id", // Day
            count: "$count", // Count of PDFs
          },
        },
      ];

      // Run the aggregation pipeline
      const aggregationResult = await PdfDetail.aggregate(pipeline);

      // Add only non-zero days to the result
      const nonZeroResults = aggregationResult.filter((item) => item.count > 0);
      nonZeroDays = [...nonZeroDays, ...nonZeroResults];

      // If more than 7 days are found, slice the last 7
      if (nonZeroDays.length >= 7) {
        nonZeroDays = nonZeroDays.slice(-7); // Keep only the last 7 non-zero days
        break;
      }

      // If less than 7, extend the search further back by another 30 days
      daysBack += 30;
    }

    return {
      status: "success",
      data: nonZeroDays,
    };
  } catch (error) {
    console.error("Error getting the PDF creation chart:", error);
    return {
      status: "error",
      message: "Failed to retrieve the PDF creation chart",
    };
  }
}
