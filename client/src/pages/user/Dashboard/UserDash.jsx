import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Spin, Flex } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import UserLayout from "../Layout/UserLayout";
import { useGetDashboardMutation } from "../../../controller/api/auth/ApiUser";

const UserDash = () => {
  const [getDashboard] = useGetDashboardMutation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    pendaftar: null,
    alamat: null,
    asal_sekolah: null,
    pembayaran: null,
    jadwal: [],
    progress: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboard().unwrap();
      setDashboardData(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const jadwalColumns = [
    {
      title: "Kegiatan",
      dataIndex: "kegiatan",
      key: "kegiatan",
    },
    {
      title: "Waktu",
      dataIndex: "waktu",
      key: "waktu",
      render: (waktu) => new Date(waktu).toLocaleString("id-ID"),
    },
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        const now = new Date();
        const jadwalTime = new Date(record.waktu);
        let status = "Belum Dimulai";
        let color = "blue";

        if (now > jadwalTime) {
          status = "Selesai";
          color = "green";
        }

        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const getProgressDetails = () => {
    const details = [];

    // Check pendaftar data
    if (dashboardData.pendaftar) {
      const requiredFields = [
        "nama",
        "nisn",
        "no_kk",
        "nik",
        "no_akta",
        "tempat_lahir",
        "tanggal_lahir",
        "kelamin",
        "agama",
        "anak_ke",
        "jml_saudara",
        "tinggi",
        "berat",
        "kepala",
        "ayah_nik",
        "ayah_nama",
        "ayah_tempat_lahir",
        "ayah_tanggal_lahir",
        "ayah_pendidikan",
        "ayah_pekerjaan",
        "ayah_no_tlp",
        "ibu_nik",
        "ibu_nama",
        "ibu_tempat_lahir",
        "ibu_tanggal_lahir",
        "ibu_pendidikan",
        "ibu_pekerjaan",
        "ibu_no_tlp",
      ];
      const missingFields = requiredFields.filter(
        (field) => !dashboardData.pendaftar[field]
      );
      if (missingFields.length === 0) {
        details.push({ status: "success", message: "Data pendaftar lengkap" });
      } else {
        details.push({
          status: "warning",
          message: `Data pendaftar belum lengkap (${missingFields.length} field kosong)`,
        });
      }
    } else {
      details.push({ status: "error", message: "Data pendaftar belum diisi" });
    }

    // Check alamat data
    if (dashboardData.alamat) {
      const requiredFields = [
        "provinsi",
        "kota",
        "kecamatan",
        "desa",
        "alamat",
        "kode_pos",
        "jarak",
        "transportasi",
      ];
      const missingFields = requiredFields.filter(
        (field) => !dashboardData.alamat[field]
      );
      if (missingFields.length === 0) {
        details.push({ status: "success", message: "Data alamat lengkap" });
      } else {
        details.push({
          status: "warning",
          message: `Data alamat belum lengkap (${missingFields.length} field kosong)`,
        });
      }
    } else {
      details.push({ status: "error", message: "Data alamat belum diisi" });
    }

    // Check asal_sekolah data
    if (dashboardData.asal_sekolah) {
      const requiredFields = [
        "npsn",
        "nama",
        "provinsi",
        "kota",
        "kecamatan",
        "desa",
      ];
      const missingFields = requiredFields.filter(
        (field) => !dashboardData.asal_sekolah[field]
      );
      if (missingFields.length === 0) {
        details.push({
          status: "success",
          message: "Data sekolah asal lengkap",
        });
      } else {
        details.push({
          status: "warning",
          message: `Data sekolah asal belum lengkap (${missingFields.length} field kosong)`,
        });
      }
    } else {
      details.push({
        status: "error",
        message: "Data sekolah asal belum diisi",
      });
    }

    // Check payment status
    if (dashboardData.pembayaran?.ket) {
      details.push({ status: "success", message: "Pembayaran sudah lunas" });
    } else {
      details.push({ status: "error", message: "Pembayaran belum lunas" });
    }

    return details;
  };

  if (loading) {
    return (
      <UserLayout>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Dashboard">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Status Pendaftaran"
              value={
                dashboardData.pendaftar?.status_pendaftaran || "Belum Mendaftar"
              }
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Kode Pendaftaran"
              value={dashboardData.pendaftar?.kode_pendaftaran || "-"}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Status Pembayaran"
              value={dashboardData.pembayaran?.ket ? "Lunas" : "Belum Lunas"}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Progress Pendaftaran"
              value={`${dashboardData.progress}%`}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Informasi Pendaftar">
            <Flex gap={8} vertical>
              {dashboardData.pendaftar ? (
                <>
                  <p>
                    <strong>Nama:</strong> {dashboardData.pendaftar.nama}
                  </p>
                  <p>
                    <strong>Jenjang:</strong>{" "}
                    {dashboardData.pendaftar.jenjang_nama}
                  </p>
                  <p>
                    <strong>Sekolah:</strong>{" "}
                    {dashboardData.pendaftar.sekolah_nama}
                  </p>
                  <p>
                    <strong>NISN:</strong> {dashboardData.pendaftar.nisn}
                  </p>
                </>
              ) : (
                <p>Belum ada data pendaftaran</p>
              )}
            </Flex>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Detail Progress Pendaftaran">
            <Flex gap={8} vertical>
              {getProgressDetails().map((detail, index) => (
                <p key={index}>
                  <Tag
                    color={
                      detail.status === "success"
                        ? "green"
                        : detail.status === "warning"
                        ? "orange"
                        : "red"
                    }
                  >
                    {detail.message}
                  </Tag>
                </p>
              ))}
            </Flex>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Jadwal Kegiatan">
            <Table
              dataSource={dashboardData.jadwal}
              columns={jadwalColumns}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </UserLayout>
  );
};

export default UserDash;
