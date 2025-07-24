import React, { useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { useSelector } from "react-redux";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useUpdateProfileMutation } from "../../../controller/api/auth/ApiUser";

const { Title } = Typography;

const AdminProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [updateProfile] = useUpdateProfileMutation();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await updateProfile(values).unwrap();
      message.success(response.message || "Profile berhasil diperbarui");
    } catch (error) {
      message.error(error.data?.message || "Gagal memperbarui profile");
    } finally {
      setLoading(false);
    }
  };

  const onPasswordFinish = async (values) => {
    try {
      setPasswordLoading(true);
      const response = await updateProfile({
        nama: user?.nama,
        email: user?.email,
        tlp: user?.tlp,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      }).unwrap();
      message.success(response.message || "Password berhasil diperbarui");
      passwordForm.resetFields();
    } catch (error) {
      message.error(error.data?.message || "Gagal memperbarui password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AdminLayout title="Profile Admin">
      <Row
        gutter={[24, 24]}
        style={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}
      >
        <Col xs={24} md={12}>
          <Card title="Profile Admin" style={{ height: "100%" }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                nama: user?.nama,
                email: user?.email,
                tlp: user?.tlp,
              }}
              onFinish={onFinish}
            >
              <Form.Item
                name="nama"
                label="Nama"
                rules={[{ required: true, message: "Nama harus diisi" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Masukkan nama" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Email harus diisi" },
                  { type: "email", message: "Email tidak valid" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Masukkan email" />
              </Form.Item>

              <Form.Item
                name="tlp"
                label="Nomor Telepon"
                rules={[
                  { required: true, message: "Nomor telepon harus diisi" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Masukkan nomor telepon"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Simpan Perubahan
                  </Button>
                  <Button onClick={() => form.resetFields()}>Reset</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <LockOutlined />
                <span>Ubah Password</span>
              </Space>
            }
            style={{ height: "100%" }}
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onPasswordFinish}
            >
              <Form.Item
                name="oldPassword"
                label="Password Lama"
                rules={[
                  { required: true, message: "Password lama harus diisi" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Masukkan password lama"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Password Baru"
                rules={[
                  { required: true, message: "Password baru harus diisi" },
                  { min: 6, message: "Password minimal 6 karakter" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Masukkan password baru"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Konfirmasi Password"
                dependencies={["newPassword"]}
                rules={[
                  {
                    required: true,
                    message: "Konfirmasi password harus diisi",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Password tidak cocok"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Konfirmasi password baru"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={passwordLoading}
                  >
                    Update Password
                  </Button>
                  <Button onClick={() => passwordForm.resetFields()}>
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
};

export default AdminProfile;
