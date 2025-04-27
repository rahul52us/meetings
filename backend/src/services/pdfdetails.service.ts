import { Request, Response } from "express";
import mongoose from "mongoose";
import { getFileData, uploadFile } from "../repository/filesystem.repository";
import {
  createFolder,
  createPdfDetail,
  findFolderById,
  findFolderByIdAndUpdate,
  getFolderDetails,
  getPdfDetails,
  updatePdfDetail,
  deleteFolder,
  deleteFile,
  getTotalPdfRepo,
  getPdfDetailById,
  getPdfCreationChart,
  getExtractedPdfDetails,
  updatePdfStatus,
  updateWorkflowStatus,
  updatePdfDetailExtractedDetails,
} from "../repository/pdfdetails.repository";
import ExcelJS from "exceljs";
import { sendTriggerRequest } from "../utils/common";
import { WORKFLOW_URL } from "../utils/env";
import compileEmailTemplate from "~/helpers/compile-email-template";
import sendMail from "~/libs/mail";
import axios from "axios";
import ZohoToken from "~/repository/schemas/zohoTOken.schema";

// Service to create a new PDF detail
export async function createFolderService(req: any, res: Response) {
  try {
    const user = req.user._id;
    const pdfDetail = await createFolder(req.body, user);
    return res.status(200).json({
      status: "success",
      message: "Folder created Successfully",
      data: pdfDetail,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error Saving the Folder detail" });
  }
}

export async function getAllFolderService(req: any, res: Response) {
  try {
    const userId = req?.user?._id;
    const role = req?.user?.role;
    const company = req?.user?.company;
    let page = (req.query.page as string) || "1";
    let limit = (req.query.limit as string) || "10";
    const search = req.query.search || "";
    const getTotal = req.query.getTotal || false;
    console.log("getTotal", getTotal)
    const pdfDetail = await getFolderDetails(
      { search },
      page,
      limit,
      getTotal,
      role,
      userId,
      company,
    );
    return res.status(200).json({
      status: "success",
      message: "Folder fetched successfully",
      data: pdfDetail.data,
      totalData: pdfDetail.totalData,
      totalPages: pdfDetail.totalPages,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching the folder details",
    });
  }
}

const sendMailToContact = async (userData: Record<string, string>, folderName: string) => {
  try {
    const { name = "User", email, ...restFields } = userData;
    const userTemplate = await compileEmailTemplate({
      fileName: 'userContactTemplate.mjml',
      data: {
        name,
        folderName,
        fields: restFields,
      },
    });

    await sendMail(
      email,
      'Thank you! We’ve received your details',
      userTemplate
    );

    // 2. Send email to ADMIN
    const adminTemplate = await compileEmailTemplate({
      fileName: 'adminContactTemplate.mjml',
      data: {
        name,
        folderName,
        fields: restFields,
      },
    });

    await sendMail(
      process.env.ADMIN_SEND_EMAIL,
      'New submission received',
      adminTemplate
    );

  } catch (err: any) {
    console.error('Mail sending failed:', err);
  }
};

const createZohoLead = async (leadData: any, accessToken: string) => {
  try {

    console.log(accessToken)

    const response = await axios.post(
      'https://www.zohoapis.in/crm/v2/Leads',
      {
        data: [
          {
            Company: leadData.company,
            Last_Name: leadData.name,
            Email: leadData.email,
            Phone: leadData.phone,
            Mobile: leadData.alternate_phone,
            Street: leadData.address,
            City: leadData.city,
            State: leadData.state,
            Country: leadData.country,
            Zip_Code: leadData.pincode,
            Designation: leadData.designation,
            Website: leadData.website,
            Tagline: leadData.tagline,
            DOB: leadData.dob,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return {
      status : 'success',
      data : response?.data
    }
  } catch (error) {
    console.log(error?.message)
    return {
      status : 'error',
      data : error?.message
    }
  }
};

// createZohoLead({company : "fsdfds", name : "name is", email : "rahul"},'1000.71f075033b7b45fd523070e1aea0d078.0bfb18e49d6ef63b5ce8aa53b8d13c62')

const testAccessToken = async (accessToken: string) => {

  // const st = await ZohoToken.findOne().sort({created_at : -1})
  // console.log(st)
  //   const response = await axios.get(
  //     'https://www.zohoapis.in/crm/v2/Leads',
  //     {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     }
  //   );
  //   console.log(response);
  // } catch (error) {
  //   console.log('Error testing access token:', error?.response?.data || error.message);
  // }
};

// testAccessToken('1000.9e4dc4cfaae6ad247773edc56f225f9a.831b429be2a1ddf9f0129134e6b1fe6e');


export async function createPdfDetailService(req: any, res: Response) {
  try {
    const { files, pages } = req.body;
    const values: any = {};
    const user = req.user._id;
    const folderData: any = await findFolderById({
      _id: new mongoose.Types.ObjectId(req.body.folderId),
    });

    if (folderData.status === "success") {
      values.extractedData = req.body.extractedData;
      values.folderId = req.body.folderId;
      values.fileName = `${folderData.data.totalPages + 1}_${
        folderData.data.totalPages + Number(pages)
      }.pdf`;
      values.pages = `${folderData.data.totalPages + 1}_${
        folderData.data.totalPages + Number(pages)
      }`;
      values.user = user;

      values.files = await Promise.all(
        files.map(async (file: any, index: number) => {
          const uploadedFile: any = await uploadFile(
            file.file,
            values.fileName,
            file.type
          );
          return {
            file: new mongoose.Types.ObjectId(uploadedFile.fileId),
          };
        })
      );

      const pdfDetail: any = await createPdfDetail(values);
      await findFolderByIdAndUpdate({
        _id: new mongoose.Types.ObjectId(req.body.folderId),
        totalPages: folderData.data.totalPages + Number(pages),
      });
      const zoho: any = await ZohoToken.findOne().sort({ created_at: -1 });
      const accessToken = zoho?.access_token;
      createZohoLead({...req.body.extractedData}, accessToken)
      sendMailToContact({...req.body.extractedData}, folderData?.data?.name)
      return res.status(200).json({
        status: "success",
        message: "PDF Detail Saved Successfully",
        data: pdfDetail,
      });
    } else {
      return res
        .status(400)
        .json({ status: "error", message: folderData?.message });
    }
  } catch (error) {
    console.log("the error are", error);
    return res
      .status(500)
      .json({ status: "error", message: "Error Saving the PDF detail" });
  }
}

export async function updatePdfDetailExtractedDataService(req: any, res: Response) {
  try {
      const dt = req.body?.data || {}
      const pdfDetail: any = await updatePdfDetailExtractedDetails({...dt,id : req.params.id});
      if(pdfDetail.status === "success")
      {
        return res.status(200).json({
          status: "success",
          message: "PDF Detail Saved Successfully",
          data: pdfDetail?.data,
        });
      }
      else
      {
        return res.status(400).json({
          status: "error",
          message: "Pdf does not exists",
          data: pdfDetail?.data,
        });
      }
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: error?.message });
  }
}

// Service to retrieve a PDF detail by ID
export async function getPdfDetailService(req: any, res: Response) {
  try {
    const userId = req?.user?._id;
    const company = req?.user?.company;
    let parentId: any = null;
    if (req.query.parentId) {
      parentId = new mongoose.Types.ObjectId(req.query.parentId);
    }
    const search = req.query.search?.trim() ? req.query.search : null;
    const filter = req.query.filter || "";
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit || 10;
    const { status, data, statusCode } = await getPdfDetails({
      role: req.user?.role,
      folderId: parentId,
      page: page,
      limit: limit,
      search,
      filter,
      userId: userId,
      company: company,
    });

    return res.status(statusCode).json({ status, data });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error getting the PDF detail" });
  }
}

export async function getExtractedPdfDetailsService(req: any, res: Response) {
  try {
    let parentId: any = null;
    if (req.query.parentId) {
      parentId = new mongoose.Types.ObjectId(req.query.parentId);
    }
    const page = req.query.page ? Number(req.query.page) : 1;
    const { status, data, statusCode } = await getExtractedPdfDetails({
      folderId: parentId,
      page: page,
    });
    return res.status(statusCode).json({ status, data });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error getting in extracting PDF Files",
    });
  }
}

export async function getPdfDetailByIdService(req: Request, res: Response) {
  try {
    const id = req.query.id as string;
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "PDF detail ID not provided" });
    }
    const updatedPdfDetail = await getPdfDetailById({
      id,
    });
    if (!updatedPdfDetail) {
      return res
        .status(404)
        .json({ status: "error", message: "PDF detail not found" });
    }
    return res.status(200).json({
      status: "success",
      message: "PDF Detail Updated Successfully",
      data: updatedPdfDetail,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error updating the PDF detail" });
  }
}

export async function updatePdfStatusService(req: Request, res: Response) {
  try {
    const id = req.body._id;
    const data = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "PDF detail ID not provided" });
    }
    const updatedPdfDetail = await updatePdfStatus({
      id,
      data,
    });

    let files: any = {};
    if (updatedPdfDetail.files[0].file) {
      let newFile: any = await getFileData(updatedPdfDetail.files[0].file);
      files = newFile;
    }
    if (req.body.status === "extracted") {
      const dt: any = {
        values: updatedPdfDetail.extractedData,
        file: { ...files },
        tags: {
          extraction: {
            type: "automatic",
          },
        },
        activeWorkflow: "66f135a0dd314d5164007c19",
        type: "field",
        approval: [],
        status: "",
        documentId: updatedPdfDetail?.workflowInfo?.documentId,
        helpInfo: {
          url: process.env.BACKEND_URL,
          updatedKey: "_id",
          updatedKeyValue: id,
          documentType: "MDM",
          status: "approved",
        },
      };
      try {
        const username = "demo-level1@sequelstring.com";
        const password = "abc123";

        const userDetails: any = await sendTriggerRequest(
          `${WORKFLOW_URL}/auth/login`,
          { username, password },
          "token"
        );
        if (userDetails.status === "success") {
          const documentDetails = await sendTriggerRequest(
            `${WORKFLOW_URL}/document/create`,
            dt,
            userDetails.data.token
          );
        }
      } catch (err: any) {
        res.status(500).send({
          status: "error",
          message: err?.message,
        });
      }
    }
    if (!updatedPdfDetail) {
      return res
        .status(404)
        .json({ status: "error", message: "PDF detail not found" });
    }
    return res.status(200).json({
      status: "success",
      message: "PDF Detail Updated Successfully",
      data: updatedPdfDetail,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error updating the PDF detail" });
  }
}

export async function updatePdfDetailService(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const data = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "PDF detail ID not provided" });
    }
    const updatedPdfDetail = await updatePdfDetail({
      id,
      data,
    });
    if (!updatedPdfDetail) {
      return res
        .status(404)
        .json({ status: "error", message: "PDF detail not found" });
    }
    return res.status(200).json({
      status: "success",
      message: "PDF Detail Updated Successfully",
      data: updatedPdfDetail,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error updating the PDF detail" });
  }
}

export async function updateWorkflowStatusService(req: Request, res: Response) {
  try {
    const id = req.body._id;
    const data = req.body;
    console.log("data in workflow service", data);
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "PDF detail ID not provided" });
    }
    const updatedPdfDetail = await updateWorkflowStatus({
      id,
      data,
    });
    if (!updatedPdfDetail) {
      return res
        .status(404)
        .json({ status: "error", message: "PDF detail not found" });
    }
    return res.status(200).json({
      status: "success",
      message: "PDF Detail Updated Successfully",
      data: updatedPdfDetail,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error updating the PDF detail" });
  }
}

// Service to delete a File by ID
export async function deleteFolderService(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "Folder ID not provided" });
    }
    const deletedFolder = await deleteFolder(id);
    if (!deletedFolder) {
      return res
        .status(404)
        .json({ status: "error", message: "Folder not found" });
    }
    return res.status(200).json({
      status: "success",
      message: "Folder Deleted Successfully",
      data: deletedFolder,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error deleting the folder" });
  }
}
// For Documents
export async function deleteFileService(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "File ID not provided" });
    }
    const deletedFile = await deleteFile(id);
    if (!deleteFile) {
      return res
        .status(404)
        .json({ status: "error", message: "FIle not found" });
    }
    return res.status(200).json({
      status: "success",
      message: "File Deleted Successfully",
      data: deletedFile,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error deleting the folder" });
  }
}

// Service to delete a file by ID
// export async function deleteFileService(req: Request, res: Response) {
//   try {
//     const id = req.params.id as string;
//     if (!id) {
//       return res
//         .status(400)
//         .json({ status: "error", message: "File ID not provided" });
//     }
//     const deletedFile = await deleteFile(id);
//     if (!deletedFile) {
//       return res
//         .status(404)
//         .json({ status: "error", message: "File not found" });
//     }
//     return res.status(200).json({
//       status: "success",
//       message: "File Deleted Successfully",
//       data: deletedFile,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ status: "error", message: "Error deleting the file" });
//   }
// }

export async function downloadAllData(req: Request, res: Response) {
  try {
    const folders = await getAllFolders();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("All Folders");

    // Define headers for the Excel file
    worksheet.columns = [
      { header: "Folder ID", key: "_id", width: 20 },
      { header: "Folder Name", key: "name", width: 30 },
      { header: "Created Date", key: "createdAt", width: 20 },
      { header: "Status", key: "status", width: 20 },
    ];

    // Pdfdetails.forEach((folder: { _id: any; name: any; createdAt: { toISOString: () => any; }; status: any; }) => {
    //   worksheet.addRow({
    //     _id: folder._id,
    //     name: folder.name,
    //     createdAt: folder.createdAt.toISOString(),
    //     status: folder.status,
    //   });
    // });

    // Set response headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=all_folders.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading all data:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to download all data" });
  }
}
function getAllFolders() {
  throw new Error("Function not implemented.");
}

export async function getTotalPdfService(req: any, res: Response) {
  try {
    const startDate: Date = new Date(req.query.startDate as string);
    const endDate: Date = new Date(req.query.endDate as string);
    const user: any = req?.user?._id;
    const role: any = req.user?.role;
    const company: any = req?.user?.company;
    console.log("user--->>", user, role);
    const result = await getTotalPdfRepo(
      startDate,
      endDate,
      user,
      role,
      company
    );
    if (result.status === "success") {
      return res.status(200).send({
        status: result.status,
        data: result.data,
      });
    } else {
      return res.status(401).send({
        status: result.status,
        data: result.data,
      });
    }
  } catch (error) {
    console.log("Error in getting total Pdf Count: ", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get total Pdf Count",
    });
  }
}

export async function getPdfCreationChartService(req: Request, res: Response) {
  try {
    const result = await getPdfCreationChart();
    if (result.status === "success") {
      return res.status(200).send({
        status: result.status,
        data: result.data,
      });
    } else {
      return res.status(401).send({
        status: result.status,
        data: result.data,
      });
    }
  } catch (error) {
    console.log("Error in getting total Pdf Count: ", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get total Pdf Count",
    });
  }
}
