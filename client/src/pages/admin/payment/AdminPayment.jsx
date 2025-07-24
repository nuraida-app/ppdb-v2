import React, { useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import {
  useGetPaymentsQuery,
  useGetDataQuery,
  useConfirmPaymentMutation,
} from "../../../controller/api/payment/ApiPayment";
import {
  Table,
  Card,
  Typography,
  Input,
  Button,
  Pagination,
  Spin,
  Space,
  Statistic,
  Row,
  Col,
  message,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import formatRupiah from "./formatRupiah";

const { Title } = Typography;

const AdminPayment = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: paymentsData, isLoading: isLoadingPayments } =
    useGetPaymentsQuery({
      page,
      limit,
      search,
    });

  const { data: paymentStats, isLoading: isLoadingStats } = useGetDataQuery();
  const [confirmPayment] = useConfirmPaymentMutation();

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleConfirmPayment = async (userId) => {
    try {
      await confirmPayment(userId).unwrap();
      message.success("Pembayaran berhasil dikonfirmasi");
    } catch (error) {
      message.error("Gagal mengkonfirmasi pembayaran");
      console.error("Error confirming payment:", error);
    }
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
    },
    {
      title: "Nominal",
      dataIndex: "nominal",
      key: "nominal",
      render: (nominal) => formatRupiah(nominal),
    },
    {
      title: "Telepon",
      dataIndex: "tlp",
      key: "tlp",
    },
    {
      title: "Berkas",
      dataIndex: "berkas",
      key: "berkas",
      render: (berkas) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          href={berkas}
          target="_blank"
          rel="noopener noreferrer"
        >
          Lihat Berkas
        </Button>
      ),
    },
    {
      title: "Status",
      dataIndex: "ket",
      key: "ket",
      render: (ket) => (
        <span style={{ color: ket ? "#52c41a" : "#faad14" }}>
          {ket ? "Terkonfirmasi" : "Belum Dikonfirmasi"}
        </span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleConfirmPayment(record.user_id)}
            disabled={record.ket}
          >
            {record.ket ? "Terkonfirmasi" : "Konfirmasi"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout title="Data Pembayaran">
      <div style={{ padding: "24px" }}>
        <Title level={2}>Data Pembayaran</Title>

        {isLoadingStats ? (
          <Spin />
        ) : (
          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col span={12}>
              <Card>
                <Statistic
                  title="Total Pembayaran"
                  value={paymentStats?.total || 0}
                  formatter={(value) => formatRupiah(value)}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="Jumlah Transaksi"
                  value={paymentStats?.jml || 0}
                />
              </Card>
            </Col>
          </Row>
        )}

        <form onSubmit={handleSearch} style={{ marginBottom: "24px" }}>
          <Space>
            <Input
              placeholder="Cari pembayaran"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: 300 }}
            />
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
              Cari
            </Button>
          </Space>
        </form>

        {isLoadingPayments ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={paymentsData?.payments}
              rowKey="id"
              pagination={false}
            />
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Pagination
                current={page}
                total={paymentsData?.totalPages * limit}
                pageSize={limit}
                onChange={(page) => setPage(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPayment;
