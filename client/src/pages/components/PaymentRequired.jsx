import React from "react";
import { Card, Result, Button, Typography, Space, Row, Col } from "antd";
import { DollarOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const PaymentRequired = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={14} xl={12}>
          <Result
            icon={<LockOutlined style={{ fontSize: "48px" }} />}
            status="error"
            title={
              <Text strong style={{ fontSize: "20px" }}>
                Pembayaran Belum Dilakukan
              </Text>
            }
            subTitle={
              <Space
                direction="vertical"
                size="large"
                style={{
                  width: "100%",
                  textAlign: "center",
                  marginTop: "16px",
                }}
              >
                <Text style={{ fontSize: "16px" }}>
                  Untuk mengakses formulir pendaftaran, Anda perlu menyelesaikan
                  pembayaran terlebih dahulu.
                </Text>
                <div style={{ marginTop: "24px" }}>
                  <Button
                    variant="solid"
                    color="danger"
                    icon={<DollarOutlined />}
                    size="large"
                    onClick={() => navigate("/user-pembayaran")}
                    style={{
                      height: "40px",
                      fontSize: "16px",
                    }}
                  >
                    Pembayaran
                  </Button>
                </div>
              </Space>
            }
            style={{
              padding: "24px 16px",
            }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default PaymentRequired;
