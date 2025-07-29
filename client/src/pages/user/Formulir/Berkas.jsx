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

// Remove file type restrictions - allow all file types
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
  if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i))
    return <FileImageOutlined style={{ color: "#1890ff" }} />;
  if (fileName.match(/\.(doc|docx)$/i))
    return <FilePdfOutlined style={{ color: "#1890ff" }} />;
  if (fileName.match(/\.(xls|xlsx)$/i))
    return <FilePdfOutlined style={{ color: "#52c41a" }} />;
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

  console.log(data);

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

  // Helper to get allowed file types for each docType - now accepts all files
  const getAcceptType = (docType) => "*";

  const handleUpload = async (file, docType) => {
    // Remove all file type and size validations
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
      <p className='ant-upload-drag-icon'>
        <UploadOutlined />
      </p>
      <p className='ant-upload-text'>
        Klik atau seret file ke sini untuk upload
      </p>
      <p className='ant-upload-hint'>
        Semua jenis file diizinkan. Tidak ada batasan ukuran file.
      </p>
    </Upload.Dragger>
  );

  const renderFileList = (docType) => {
    const file = filesByType[docType];
    const docLabel =
      DOC_TYPES.find((doc) => doc.key === docType)?.label || docType;

    if (!file) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type='secondary'>Berkas Belum diupload</Text>
        </div>
      );
    }
    // Clean up file_link if it starts with undefined
    let fileLink = file.file_link;
    if (fileLink.startsWith("undefined/")) {
      fileLink = fileLink.replace("undefined/", "/");
    }
    // For Foto, show preview if image
    if (
      docType === "Foto" &&
      fileLink.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)
    ) {
      return (
        <div>
          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <Text strong>Preview Berkas {docLabel}</Text>
          </div>
          <List.Item
            actions={[
              <a href={fileLink} target='_blank' rel='noopener noreferrer'>
                <Button icon={<DownloadOutlined />} size='small'>
                  Download
                </Button>
              </a>,
              <Popconfirm
                title='Hapus file ini?'
                onConfirm={() => handleDelete(file.id)}
                okText='Ya'
                cancelText='Batal'
                disabled={isDeleting}
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  size='small'
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
                  {file.file_name} <Tag color='green'>Sudah diupload</Tag>
                </span>
              }
              description={
                <img
                  src={fileLink}
                  alt='Preview Foto'
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
        </div>
      );
    }
    // Default file display
    return (
      <div>
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <Text strong>Preview Berkas {docLabel}</Text>
        </div>
        <List.Item
          actions={[
            <a href={fileLink} target='_blank' rel='noopener noreferrer'>
              <Button icon={<DownloadOutlined />} size='small'>
                Download
              </Button>
            </a>,
            <Popconfirm
              title='Hapus file ini?'
              onConfirm={() => handleDelete(file.id)}
              okText='Ya'
              cancelText='Batal'
              disabled={isDeleting}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                size='small'
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
                {file.file_name} <Tag color='green'>Sudah diupload</Tag>
              </span>
            }
            description={
              <>
                <Tag color='blue'>
                  {fileLink.split(".").pop().toUpperCase()}
                </Tag>
                <span style={{ marginLeft: 8 }}>
                  {(fileLink.match(/\d+MB/) || [])[0]}
                </span>
              </>
            }
          />
        </List.Item>
      </div>
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
              Semua jenis file diizinkan. Tidak ada batasan ukuran file.
            </div>
            <div>
              Pastikan file yang diupload sesuai dengan ketentuan yang diminta.
            </div>
          </div>
        </div>
      }
      style={{ marginTop: 16 }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type='card'
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
