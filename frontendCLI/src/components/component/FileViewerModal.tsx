import React, { useCallback, useEffect, useState } from "react";
import { Modal, Spinner, Text, Image, Alert, Button } from "native-base";
import RNFetchBlob from "rn-fetch-blob"; // Keep using rn-fetch-blob
import Pdf from "react-native-pdf";
import { Platform } from "react-native";
import { appRequest } from "../../routes";
import { Buffer } from "buffer"; // Added for base64 encoding

type FileType = {
  _id: string;
  metadata?: {
    contentType?: string;
    name?: string;
  };
};

type FileViewerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  file: any;
};

const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  const [fileData, setFileData] = useState<{ uri: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFileExtension = (contentType: string, fileName?: string) => {
    if (fileName) {
      const ext = fileName.split(".").pop()?.toLowerCase();
      if (ext && ["pdf", "jpg", "jpeg", "png", "gif"].includes(ext)) return ext;
    }
    if (contentType.includes("pdf")) return "pdf";
    if (contentType.includes("image/jpeg")) return "jpg";
    if (contentType.includes("image/png")) return "png";
    if (contentType.includes("image/gif")) return "gif";
    return "bin";
  };

  const fetchFileById = async (fileId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response: any = await appRequest("filesystem", "get", { id: fileId });
      console.log("Backend response type:", typeof response, "Sample:", response?.slice(0, 10));

      if (!response || response?.error) {
        throw new Error(response?.error || "File fetch failed");
      }

      let buffer: Uint8Array;
      if (Array.isArray(response)) {
        // Direct byte array (e.g., [55, 57, 49, ...])
        buffer = new Uint8Array(response);
      } else if (typeof response === "string") {
        // Handle base64 or JSON string
        try {
          const parsed = JSON.parse(response);
          if (Array.isArray(parsed)) {
            buffer = new Uint8Array(parsed);
          } else {
            throw new Error("Parsed response is not an array");
          }
        } catch {
          // Assume base64 string
          const base64Data = response.startsWith("data:") ? response.split(",")[1] : response;
          buffer = Buffer.from(base64Data, "base64");
        }
      } else {
        throw new Error("Invalid response format");
      }

      console.log("Buffer length:", buffer.length, "First bytes:", buffer.slice(0, 10));

      // Get MIME type and extension
      const contentType = file?.metadata?.contentType || "application/octet-stream";
      const ext = getFileExtension(contentType, file?.metadata?.filename);
      const fileName = file?.metadata?.name || `${fileId}.${ext}`;
      const filePath = `${
        Platform.OS === "android" ? RNFetchBlob.fs.dirs.CacheDir : RNFetchBlob.fs.dirs.DocumentDir
      }/${fileName}`;

      // Convert buffer to base64 for RNFetchBlob
      const base64Data = Buffer.from(buffer).toString("base64");

      // Write file
      await RNFetchBlob.fs.writeFile(filePath, base64Data, "base64");

      // Verify file exists
      const exists = await RNFetchBlob.fs.exists(filePath);
      if (!exists) {
        throw new Error("File write failed");
      }

      return {
        uri: Platform.OS === "android" ? `file://${filePath}` : filePath,
        type: contentType,
      };
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load file";
      console.error("Error in fetchFileById:", errorMessage, err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cleanupFile = async (uri: string) => {
    try {
      const path = uri.replace("file://", "");
      if (await RNFetchBlob.fs.exists(path)) {
        await RNFetchBlob.fs.unlink(path);
        console.log("Cleaned up file:", path);
      }
    } catch (err) {
      console.error("Error cleaning up file:", err);
    }
  };

  const getFile = useCallback(async () => {
    if (!file?._id) {
      setError("No file ID provided");
      return;
    }
    try {
      const result = await fetchFileById(file._id);
      setFileData(result);
    } catch {
      setFileData(null);
    }
  }, [file]);

  useEffect(() => {
    if (isOpen) {
      getFile();
    } else {
      if (fileData?.uri) {
        cleanupFile(fileData.uri);
      }
      setFileData(null);
      setError(null);
    }
    return () => {
      if (fileData?.uri) {
        cleanupFile(fileData.uri);
      }
    };
  }, [isOpen, getFile, fileData]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" backgroundColor="black">
      <Modal.Content flex={1} backgroundColor="black">
        <Modal.CloseButton />
        <Modal.Body p={0} flex={1} alignItems="center" justifyContent="center">
          {loading ? (
            <Spinner size="lg" color="teal.400" />
          ) : error ? (
            <Alert w="90%" status="error">
              <Alert.Icon />
              <Text fontWeight="bold" fontSize="md" color="error.700">
                Error
              </Text>
              <Text fontSize="sm" color="error.600">
                {error}
              </Text>
              <Button mt={2} onPress={getFile} colorScheme="error" size="sm">
                Retry
              </Button>
            </Alert>
          ) : fileData?.type?.includes("pdf") ? (
            <Pdf
              source={{ uri: fileData.uri, cache: true }}
              style={{ flex: 1, width: "100%" }}
              onLoadComplete={(pages) => console.log(`PDF loaded with ${pages} pages`)}
              onError={(err) => {
                console.error("PDF render error:", err);
                setError("Failed to render PDF");
              }}
            />
          ) : fileData?.type?.startsWith("image") ? (
            <Image
              source={{ uri: fileData.uri }}
              alt="Image"
              resizeMode="contain"
              style={{ width: "100%", height: "100%" }}
              onError={(e) => {
                console.error("Image render error:", e.nativeEvent.error);
                setError("Failed to render image");
              }}
            />
          ) : (
            <Text color="white">Unsupported file format: {fileData?.type || "unknown"}</Text>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default FileViewerModal;