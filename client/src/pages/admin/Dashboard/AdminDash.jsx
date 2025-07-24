import React from "react";
import AdminLayout from "../Layout/AdminLayout";
import { Card, Row, Col, Statistic, Table } from "antd";
import {
  UserOutlined,
  CreditCardOutlined,
  TeamOutlined,
  BankOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useGetDataQuery } from "../../../controller/api/admin/ApiStatistic";

const AdminDash = () => {
  const { data: dashboardData, isLoading } = useGetDataQuery();

  if (isLoading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  // Add keys to jenjang data
  const jenjangData =
    dashboardData?.jenjang?.map((item, index) => ({
      ...item,
      key: `jenjang-${index}`,
    })) || [];

  // Add keys to sekolah data
  const sekolahData =
    dashboardData?.sekolah_terpopuler?.map((item, index) => ({
      ...item,
      key: `sekolah-${index}`,
    })) || [];

  // Columns for jenjang table
  const jenjangColumns = [
    {
      title: "Jenjang",
      dataIndex: "jenjang",
      key: "jenjang",
    },
    {
      title: "Jumlah Pendaftar",
      dataIndex: "jumlah_pendaftar",
      key: "jumlah_pendaftar",
    },
  ];

  // Columns for sekolah table
  const sekolahColumns = [
    {
      title: "Nama Sekolah",
      dataIndex: "nama_sekolah",
      key: "nama_sekolah",
    },
    {
      title: "Jumlah Pendaftar",
      dataIndex: "jumlah_pendaftar",
      key: "jumlah_pendaftar",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <Row gutter={[16, 16]}>
        {/* Statistik Pendaftar */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="Statistik Pendaftar">
            <Statistic
              title="Total Pendaftar"
              value={dashboardData?.pendaftar?.total}
              prefix={<UserOutlined />}
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="Laki-laki"
                  value={dashboardData?.pendaftar?.laki_laki}
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Perempuan"
                  value={dashboardData?.pendaftar?.perempuan}
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Statistik Pembayaran */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="Statistik Pembayaran">
            <Statistic
              title="Total Pembayaran"
              value={dashboardData?.pembayaran?.total_pembayaran}
              prefix="Rp"
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="Total Transaksi"
                  value={dashboardData?.pembayaran?.total_transaksi}
                  prefix={<CreditCardOutlined />}
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Rata-rata"
                  value={dashboardData?.pembayaran?.rata_rata_pembayaran}
                  prefix="Rp"
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Statistik Pengguna */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="Statistik Pengguna">
            <Statistic
              title="Total Pengguna"
              value={dashboardData?.pengguna?.total}
              prefix={<TeamOutlined />}
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="Admin"
                  value={dashboardData?.pengguna?.admin}
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="User"
                  value={dashboardData?.pengguna?.user}
                  valueStyle={{ fontSize: "16px" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Tabel Statistik Jenjang */}
        <Col xs={24} sm={12}>
          <Card title="Statistik per Jenjang">
            <Table
              dataSource={jenjangData}
              columns={jenjangColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Tabel Sekolah Terpopuler */}
        <Col xs={24} sm={12}>
          <Card title="Sekolah">
            <Table
              dataSource={sekolahData}
              columns={sekolahColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Status Pendaftaran */}
        <Col xs={24}>
          <Card title="Status Pendaftaran">
            <Row gutter={[16, 16]}>
              {dashboardData?.status_pendaftaran.map((status, index) => (
                <Col xs={24} sm={8} key={`status-${index}`}>
                  <Card>
                    <Statistic
                      title={status.status_pendaftaran || "Belum Ada Status"}
                      value={status.jumlah}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
};

export default AdminDash;
