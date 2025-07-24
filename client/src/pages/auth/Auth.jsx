import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Modal,
  Spin,
  Flex,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useSigninMutation,
  useSignupMutation,
  useLoadUserMutation,
} from "../../controller/api/auth/ApiAuth";
import Recovery from "./Recovery";

const { Title, Text } = Typography;

const LoadingScreen = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #6f42c1 0%, #9b6bff 100%)",
    }}
  >
    <Spin size="large" />
  </div>
);

const Auth = ({ data }) => {
  const [searchParams] = useSearchParams();

  const isRecovery = searchParams.get("recovery");

  const [form] = Form.useForm();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const [signin, { isLoading: isSigninLoading }] = useSigninMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();
  const [loadUser] = useLoadUserMutation();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Auth check timeout")), 3000)
        );

        const response = await Promise.race([
          loadUser().unwrap(),
          timeoutPromise,
        ]);

        if (!mounted) return;

        const user = response;
        if (user) {
          if (user.peran === "admin") {
            window.location.href = "/admin-dashboard";
          } else if (user.peran === "user") {
            window.location.href = "/user-dashboard";
          }
        }
      } catch (error) {
        return;
      } finally {
        if (mounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [navigate, loadUser]);

  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  const onFinish = async (values) => {
    try {
      let response;
      if (isSignUp) {
        response = await signup(values).unwrap();
        message.success("Sign up successful! Please sign in.");
        setIsSignUp(false);
        form.resetFields();
        return;
      } else {
        response = await signin(values).unwrap();
        message.success("Sign in successful!");
      }

      const user = response.user;
      if (user.peran === "admin") {
        navigate("/admin-dashboard");
      } else if (user.peran === "user") {
        navigate("/user-dashboard");
      } else {
        Modal.error({
          title: "Error",
          content: "Level tidak terdeteksi",
        });
      }
    } catch (error) {
      message.error(
        error.data?.message || `${isSignUp ? "Sign up" : "Sign in"} failed`
      );
      console.log(error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #6f42c1 0%, #9b6bff 100%)",
      }}
    >
      {isRecovery ? (
        <Recovery />
      ) : (
        <Card
          style={{
            width: 400,
            maxWidth: "90%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Title level={2} style={{ color: "#6f42c1", margin: 0 }}>
              {isSignUp ? "Buat Akun" : `${data?.nama}`}
            </Title>
            <Text type="secondary">
              {isSignUp ? "Buat akun untuk memulai" : "Masuk untuk melanjutkan"}
            </Text>
          </div>

          <Form
            form={form}
            name="auth"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            {isSignUp && (
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Masukkan nama calon siswa!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nama Calon Siswa"
                />
              </Form.Item>
            )}

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Masukkan email!" },
                { type: "email", message: "Masukkan email yang valid!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            {isSignUp && (
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: "Masukkan nomor whatsapp!" },
                ]}
              >
                <Input prefix={<WhatsAppOutlined />} placeholder="Whatsapp" />
              </Form.Item>
            )}

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Masukkan password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            {isSignUp && (
              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Konfirmasi password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Password tidak cocok!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Konfirmasi Password"
                />
              </Form.Item>
            )}

            <Form.Item style={{ marginBottom: 12 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSigninLoading || isSignupLoading}
                style={{
                  backgroundColor: "#6f42c1",
                  borderColor: "#6f42c1",
                  height: "40px",
                }}
              >
                {isSignUp ? "Buat Akun" : "Masuk"}
              </Button>
            </Form.Item>
          </Form>

          <Flex gap="small" justify={isSignUp ? "center" : "space-between"}>
            <Button
              type="link"
              onClick={() => {
                setIsSignUp(!isSignUp);
                form.resetFields();
              }}
              style={{ color: "#6f42c1" }}
            >
              {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}
            </Button>

            {!isSignUp && (
              <Button
                type="link"
                style={{ color: "#6f42c1" }}
                onClick={() => navigate("?recovery=true")}
              >
                Lupa Password?
              </Button>
            )}
          </Flex>
        </Card>
      )}
    </div>
  );
};

export default Auth;
