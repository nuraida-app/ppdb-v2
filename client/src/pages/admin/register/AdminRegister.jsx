import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Space,
  Tag,
  Input,
  Select,
  Typography,
  message,
} from "antd";
import {
  useGetFormsQuery,
  useChangeStatusMutation,
} from "../../../controller/api/form/ApiForm";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";
import { useGetLevelsMutation } from "../../../controller/api/admin/ApiGrade";

const { Title, Text } = Typography;
const { Search } = Input;

const AdminRegister = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // null means show all statuses
  const [level, setLevel] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error } = useGetFormsQuery({
    status,
    page,
    limit,
    search,
    level,
  });
  const [getLevels, { data: levels }] = useGetLevelsMutation();

  const [
    changeStatus,
    { isSuccess, error: changeStatusError, data: changeStatusData },
  ] = useChangeStatusMutation();

  useEffect(() => {
    if (error) {
      console.error("Error fetching data:", error);
      message.error("Gagal memuat data pendaftar");
    }
  }, [error]);

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1); // Reset to first page when status changes
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page when search changes
  };

  const handleActionChange = async (value, record) => {
    if (value === "detail") {
      navigate(`/admin-pendaftar/${record.userid}`);
    } else {
      await changeStatus({ id: record.userid, status: value });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(changeStatusData.message);
    }
    if (changeStatusError) {
      message.error(changeStatusError.data.message);
    }
  }, [isSuccess, changeStatusData, changeStatusError]);

  useEffect(() => {
    getLevels({ page: "", limit: "", search: "" });
  }, [getLevels]);

  const columns = [
    {
      title: "Kode Pendaftaran",
      dataIndex: "kode_pendaftaran",
      key: "kode_pendaftaran",
    },
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      render: (nama) =>
        nama ? nama : <Text type="danger">Belum mengisi formulir</Text>,
    },
    {
      title: "NISN",
      dataIndex: "nisn",
      key: "nisn",
    },
    {
      title: "Whatsapp",
      dataIndex: "tlp_user",
      key: "tlp_user",
      render: (text) => (
        <a
          href={`https://wa.me/${text}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Status",
      dataIndex: "status_pendaftaran",
      key: "status_pendaftaran",
      render: (status) => {
        let color = "default";
        if (status === "Diterima") color = "success";
        else if (status === "Ditolak") color = "error";
        else if (status === "Diproses") color = "processing";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Select
          value={record.status_pendaftaran}
          style={{ width: 120 }}
          onChange={(value) => handleActionChange(value, record)}
          options={[
            { value: "Diproses", label: "Diproses" },
            { value: "Diterima", label: "Diterima" },
            { value: "Ditolak", label: "Ditolak" },
            { value: "detail", label: "Detail" },
          ]}
        />
      ),
    },
  ];

  return (
    <AdminLayout title="Manajemen Pendaftaran">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Title level={4}>Manajemen Pendaftaran</Title>
          <Space size="middle" style={{ marginBottom: 16 }}>
            <Select
              value={status}
              onChange={handleStatusChange}
              style={{ width: 120 }}
              placeholder="Status"
              allowClear
              options={[
                { value: "Diproses", label: "Diproses" },
                { value: "Diterima", label: "Diterima" },
                { value: "Ditolak", label: "Ditolak" },
              ]}
            />
            <Select
              value={level}
              onChange={(value) => setLevel(value)}
              style={{ width: 120 }}
              placeholder="Jenjang"
              allowClear
              options={levels?.map((level) => ({
                value: level.id,
                label: level.nama,
              }))}
            />
            <Search
              placeholder="Cari pendaftar..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
          </Space>
          <Table
            columns={columns}
            dataSource={data?.users}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: limit,
              total: data?.totalPages * limit,
              onChange: (page) => setPage(page),
            }}
          />
        </Card>
      </Space>
    </AdminLayout>
  );
};

export default AdminRegister;
