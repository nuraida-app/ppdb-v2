import React, { useState } from "react";
import { Table, Input, Button, Space, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import AdminLayout from "../Layout/AdminLayout";
import { useGetUsersMutation } from "../../../controller/api/auth/ApiUser";

const AdminUser = () => {
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [getUsers, { data, isLoading }] = useGetUsersMutation();

  const fetchUsers = async (page = 1, limit = 10, search = "") => {
    try {
      await getUsers({ page, limit, search });
    } catch (error) {
      message.error("Gagal mengambil data pengguna");
    }
  };

  React.useEffect(() => {
    fetchUsers(pagination.current, pagination.pageSize, searchText);
  }, [pagination.current, pagination.pageSize, searchText]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "User_id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Whatsapp",
      dataIndex: "tlp",
      key: "tlp",
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
  ];

  return (
    <AdminLayout title="Manajemen Pengguna">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="Cari pengguna"
            onSearch={handleSearch}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.users}
        rowKey="id"
        pagination={{
          ...pagination,
          total: data?.totalPages * pagination.pageSize,
        }}
        loading={isLoading}
        onChange={handleTableChange}
      />
    </AdminLayout>
  );
};

export default AdminUser;
