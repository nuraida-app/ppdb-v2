import React, { useState, useEffect } from "react";
import AdminLayout from "../Layout/AdminLayout";
import {
  useGetSettingQuery,
  useUpdateSettingMutation,
} from "../../../controller/api/admin/ApiSetting";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Image,
  Upload,
  Typography,
  Spin,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Title } = Typography;

const AdminSetting = () => {
  const { data: setting, isLoading, isError, error } = useGetSettingQuery();
  const [updateSetting] = useUpdateSettingMutation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  // Update form values when setting data is loaded
  useEffect(() => {
    if (setting) {
      form.setFieldsValue({
        nama: setting.nama,
        deskripsi: setting.deskripsi,
      });
    }
  }, [setting, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("nama", values.nama);
      formData.append("deskripsi", values.deskripsi);
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await updateSetting(formData).unwrap();
      message.success(response.message || "Pengaturan berhasil diperbarui");
    } catch (error) {
      message.error(error.data?.message || "Gagal memperbarui pengaturan");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (info) => {
    if (info.file.status === "done") {
      setLogoFile(info.file.originFileObj);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Pengaturan Website">
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <Spin size="large">
            <div
              style={{
                padding: "50px",
                background: "rgba(0, 0, 0, 0.05)",
                borderRadius: "4px",
              }}
            >
              Memuat Aplikasi...
            </div>
          </Spin>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout title="Pengaturan Website">
        <Card>
          <Typography.Text type="danger">
            Error: {error?.data?.message || "Gagal memuat pengaturan"}
          </Typography.Text>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pengaturan Website">
      <Card
        title="Pengaturan Website"
        style={{ maxWidth: 800, margin: "0 auto" }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="nama"
            label="Nama Website"
            rules={[{ required: true, message: "Nama website harus diisi" }]}
          >
            <Input placeholder="Masukkan nama website" />
          </Form.Item>

          <Form.Item
            name="deskripsi"
            label="Deskripsi"
            rules={[{ required: true, message: "Deskripsi harus diisi" }]}
          >
            <TextArea rows={4} placeholder="Masukkan deskripsi website" />
          </Form.Item>

          <Form.Item label="Logo Website">
            <Space
              direction="horizontal"
              size="large"
              style={{ width: "100%" }}
            >
              <Upload
                accept="image/*"
                maxCount={1}
                beforeUpload={() => false}
                onChange={handleLogoChange}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Pilih Logo Baru</Button>
              </Upload>

              {setting?.logo && (
                <div>
                  <Image
                    src={setting.logo}
                    alt="Logo Website"
                    style={{ maxWidth: 200, maxHeight: 200 }}
                    preview={false}
                  />
                </div>
              )}
            </Space>
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Simpan Perubahan
              </Button>
              <Button onClick={() => form.resetFields()}>Reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </AdminLayout>
  );
};

export default AdminSetting;
