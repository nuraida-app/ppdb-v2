import React, { useState } from "react";
import UserLayout from "../Layout/UserLayout";
import { useSelector } from "react-redux";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Row,
  Col,
  Avatar,
  Typography,
  Divider,
  Tag,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useUpdateProfileMutation } from "../../../controller/api/auth/ApiUser";

const { Title, Text } = Typography;

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [updateProfile] = useUpdateProfileMutation();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await updateProfile(values).unwrap();
      message.success(response.message);
    } catch (error) {
      message.error(error.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto p-6">
        <Row gutter={[24, 24]}>
          {/* User Info Card */}
          <Col xs={24} md={8}>
            <Card className="shadow-lg h-full">
              <div className="text-center">
                <Avatar size={100} icon={<UserOutlined />} className="mb-4" />
                <Title level={3}>{user?.nama}</Title>
                <Tag color="blue" className="mb-4">
                  {user?.peran?.toUpperCase()}
                </Tag>
                <Divider />
                <div className="text-left">
                  <div className="mb-4">
                    <Text type="secondary">
                      <CalendarOutlined className="mr-2" />
                      Registered since
                    </Text>
                    <br />
                    <Text strong>{formatDate(user?.createdat)}</Text>
                  </div>
                  <div>
                    <Text type="secondary">
                      <SafetyCertificateOutlined className="mr-2" />
                      Account Status
                    </Text>
                    <br />
                    <Tag color="success">Active</Tag>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Profile Update Form */}
          <Col xs={24} md={16}>
            <Card
              title={
                <div className="flex items-center">
                  <UserOutlined className="mr-2" />
                  <span>Edit Profile</span>
                </div>
              }
              className="shadow-lg"
            >
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
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="nama"
                      label="Full Name"
                      rules={[
                        { required: true, message: "Please input your name!" },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Enter your full name"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Please input your email!" },
                        {
                          type: "email",
                          message: "Please enter a valid email!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="Enter your email"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="tlp"
                  label="Phone Number"
                  rules={[
                    {
                      required: true,
                      message: "Please input your phone number!",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Enter your phone number"
                  />
                </Form.Item>

                <Card
                  title={
                    <div className="flex items-center">
                      <LockOutlined className="mr-2" />
                      <span>Change Password</span>
                    </div>
                  }
                  className="mt-6 bg-gray-50"
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="oldPassword" label="Current Password">
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="Enter current password"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="newPassword"
                        label="New Password"
                        dependencies={["oldPassword"]}
                        rules={[
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!getFieldValue("oldPassword") || !value) {
                                return Promise.resolve();
                              }
                              if (value.length < 6) {
                                return Promise.reject(
                                  new Error(
                                    "Password must be at least 6 characters!"
                                  )
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="Enter new password"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                <Form.Item style={{ marginTop: 16, textAlign: "right" }}>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Update Profile
                    </Button>
                    <Button onClick={() => form.resetFields()}>Reset</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </UserLayout>
  );
};

export default UserProfile;
