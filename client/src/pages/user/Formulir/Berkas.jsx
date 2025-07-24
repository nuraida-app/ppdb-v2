import React, { useState, useRef } from "react";
import {
  Card,
  Button,
  Upload,
  message,
  Tabs,
  List,
  Typography,
  Space,
  Popconfirm,
  Tag,
  Spin,
} from "antd";
import {
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import {
  useGetFilesQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
} from "../../../controller/api/form/ApiForm";
import { useSelector } from "react-redux";

const { Text } = Typography;

const FILE_TYPES = ["pdf", "jpg", "jpeg", "png"];
const MAX_SIZE_MB = 4;
const DOC_TYPES = [
  { key: "KK", label: "Kartu Keluarga" },
  { key: "Akta", label: "Akta Kelahiran" },
  { key: "Ayah", label: "KTP Ayah" },
  { key: "Ibu", label: "KTP Ibu" },
  { key: "IJSKL", label: "Ijazah / SKL" },
  { key: "Rapot", label: "Rapot" },
  { key: "Foto", label: "Foto" },
];

const getFileIcon = (fileName) => {
  if (fileName.match(/\.(pdf)$/i))
    return <FilePdfOutlined style={{ color: "#d4380d" }} />;
  if (fileName.match(/\.(jpg|jpeg|png)$/i))
    return <FileImageOutlined style={{ color: "#1890ff" }} />;
  return <FileImageOutlined />;
};

const Berkas = ({ value }) => {
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState(DOC_TYPES[0].key);
  const [uploadFile] = useUploadFileMutation();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();
  const { data, isLoading, refetch } = useGetFilesQuery(userId, {
    skip: !userId,
  });
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef({});

  // Ambil data berkas dari value jika ada, jika tidak dari API
  const fileList =
    Array.isArray(value) && value.length > 0
      ? value
      : data?.length
      ? data
      : data?.documents || [];

  // Group files by type
  const filesByType = fileList.reduce((acc, file) => {
    acc[file.file_name] = file;
    return acc;
  }, {});

  // Helper to get allowed file types for each docType
  const getAcceptType = (docType) =>
    docType === "Foto" ? ".jpg,.jpeg,.png" : ".pdf,.jpg,.jpeg,.png";

  // Helper to check file type for Foto
  const isFotoFileValid = (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png"].includes(ext);
  };

  const handleUpload = async (file, docType) => {
    const ext = file.name.split(".").pop().toLowerCase();
    // Validasi format file
    if (docType === "Foto" && !["jpg", "jpeg", "png"].includes(ext)) {
      message.error(
        "Format file tidak sesuai! Foto hanya boleh JPG, JPEG, atau PNG."
      );
      return Upload.LIST_IGNORE;
    }
    if (!FILE_TYPES.includes(ext) || (docType === "Foto" && ext === "pdf")) {
      message.error(
        docType === "Foto"
          ? "Format file tidak sesuai! Foto hanya boleh JPG, JPEG, atau PNG."
          : "Format file tidak sesuai! Hanya PDF, JPG, JPEG, PNG yang diizinkan."
      );
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      message.error(`Ukuran file maksimal ${MAX_SIZE_MB}MB.`);
      return Upload.LIST_IGNORE;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("name", docType);
    formData.append(docType, file);
    try {
      await uploadFile(formData).unwrap();
      message.success("Berkas berhasil diupload!");
      refetch();
    } catch (err) {
      message.error("Gagal upload berkas.");
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleDelete = async (fileId) => {
    try {
      await deleteFile(fileId).unwrap();
      message.success("Berkas berhasil dihapus!");
      refetch();
    } catch (err) {
      message.error("Gagal menghapus berkas.");
    }
  };

  const renderUpload = (docType) => (
    <Upload.Dragger
      name={docType}
      customRequest={({ file }) => handleUpload(file, docType)}
      showUploadList={false}
      accept={getAcceptType(docType)}
      disabled={uploading}
      style={{ marginBottom: 16 }}
    >
      <p className="ant-upload-drag-icon">
        <UploadOutlined />
      </p>
      <p className="ant-upload-text">
        Klik atau seret file ke sini untuk upload
      </p>
      <p className="ant-upload-hint">
        {docType === "Foto"
          ? "Format: JPG, JPEG, PNG. Maksimal 4MB."
          : "Format: PDF, JPG, JPEG, PNG. Maksimal 4MB."}
      </p>
    </Upload.Dragger>
  );

  const renderFileList = (docType) => {
    const file = filesByType[docType];
    if (!file) return <Text type="secondary">Belum ada file diupload.</Text>;
    // Clean up file_link if it starts with undefined
    let fileLink = file.file_link;
    if (fileLink.startsWith("undefined/")) {
      fileLink = fileLink.replace("undefined/", "/");
    }
    // For Foto, show preview if image
    if (docType === "Foto" && fileLink.match(/\.(jpg|jpeg|png)$/i)) {
      return (
        <List.Item
          actions={[
            <a href={fileLink} target="_blank" rel="noopener noreferrer">
              <Button icon={<DownloadOutlined />} size="small">
                Download
              </Button>
            </a>,
            <Popconfirm
              title="Hapus file ini?"
              onConfirm={() => handleDelete(file.id)}
              okText="Ya"
              cancelText="Batal"
              disabled={isDeleting}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                loading={isDeleting}
              >
                Hapus
              </Button>
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            avatar={getFileIcon(fileLink)}
            title={
              <span>
                {file.file_name} <Tag color="green">Sudah diupload</Tag>
              </span>
            }
            description={
              <img
                src={fileLink}
                alt="Preview Foto"
                style={{
                  maxWidth: 120,
                  maxHeight: 120,
                  borderRadius: 8,
                  marginTop: 8,
                }}
              />
            }
          />
        </List.Item>
      );
    }
    // Default file display
    return (
      <List.Item
        actions={[
          <a href={fileLink} target="_blank" rel="noopener noreferrer">
            <Button icon={<DownloadOutlined />} size="small">
              Download
            </Button>
          </a>,
          <Popconfirm
            title="Hapus file ini?"
            onConfirm={() => handleDelete(file.id)}
            okText="Ya"
            cancelText="Batal"
            disabled={isDeleting}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              loading={isDeleting}
            >
              Hapus
            </Button>
          </Popconfirm>,
        ]}
      >
        <List.Item.Meta
          avatar={getFileIcon(fileLink)}
          title={
            <span>
              {file.file_name} <Tag color="green">Sudah diupload</Tag>
            </span>
          }
          description={
            <>
              <Tag color="blue">{fileLink.split(".").pop().toUpperCase()}</Tag>
              <span style={{ marginLeft: 8 }}>
                {(fileLink.match(/\d+MB/) || [])[0]}
              </span>
            </>
          }
        />
      </List.Item>
    );
  };

  return (
    <Card
      title={
        <div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
            <div>
              <span style={{ fontStyle: "italic" }}>
                Pastikan berkas yang diupload sesuai dengan ketentuan
              </span>
            </div>
            <div>
              Semua file <b>WAJIB SCAN PDF</b>, Foto <b>JPG / JPEG / PNG</b>
            </div>
            <div>
              Foto 3x4 (max 4mb), SMP (Latar Merah Berseragam SD), SMA (Latar
              Biru Berseragam SMP)
            </div>
          </div>
        </div>
      }
      style={{ marginTop: 16 }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={DOC_TYPES.map((doc) => ({
          key: doc.key,
          label: (
            <span>
              {doc.label}
              {filesByType[doc.key] && (
                <CheckCircleFilled
                  style={{ color: "#52c41a", marginLeft: 8 }}
                />
              )}
            </span>
          ),
          children: (
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              {renderUpload(doc.key)}
              <Spin spinning={isLoading || uploading}>
                <List>{renderFileList(doc.key)}</List>
              </Spin>
            </div>
          ),
        }))}
      />
    </Card>
  );
};

export default Berkas;
