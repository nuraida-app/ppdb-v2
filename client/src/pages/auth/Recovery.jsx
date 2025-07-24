import { useEffect } from "react";
import { Button, Card, Flex, Form, Input, message, Typography } from "antd";
import {
  MailOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useRecoveryMutation } from "../../controller/api/auth/ApiAuth";

const Recovery = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [recovery, { data, isLoading, isSuccess, isError, error }] =
    useRecoveryMutation();

  const onFinish = (values) => {
    recovery(values);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      navigate("/");
    }

    if (isError) {
      message.error(error.data.message);
    }
  }, [isSuccess, isError, error, data]);

  return (
    <Card
      style={{
        width: 400,
        maxWidth: "90%",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
      }}
    >
      <Flex justify="center" align="center" gap="small" vertical>
        <Typography.Title level={2} style={{ color: "#6f42c1", margin: 0 }}>
          Lupa Password
        </Typography.Title>
        <Typography.Text type="secondary" style={{ textAlign: "center" }}>
          Masukkan email yang terdaftar untuk mengatur ulang password
        </Typography.Text>
      </Flex>

      <Form style={{ marginTop: "16px" }} form={form} onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Masukkan email!" },
            { type: "email", message: "Masukkan email yang valid!" },
          ]}
          style={{ margin: "0 0 16px 0" }}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Masukkan password baru!" }]}
          style={{ margin: "0 0 16px 0" }}
        >
          <Input prefix={<LockOutlined />} placeholder="Password Baru" />
        </Form.Item>

        <Form.Item style={{ margin: 0 }}>
          <Flex justify="space-between">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
              color="danger"
              variant="outlined"
            >
              Kembali
            </Button>

            <Button
              color="primary"
              variant="outlined"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={isLoading}
              disabled={isLoading}
            >
              Kirim
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Recovery;
