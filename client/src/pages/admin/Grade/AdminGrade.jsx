import React, { useState } from "react";
import { Table, Input, Button, Space, Modal, Form, message } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import AdminLayout from "../Layout/AdminLayout";
import {
  useGetLevelsMutation,
  useAddLevelMutation,
  useDelLevelMutation,
} from "../../../controller/api/admin/ApiGrade";

const AdminGrade = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editingLevel, setEditingLevel] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [getLevels, { data, isLoading }] = useGetLevelsMutation();
  const [addLevel] = useAddLevelMutation();
  const [delLevel] = useDelLevelMutation();

  const fetchLevels = async (page = 1, limit = 10, search = "") => {
    try {
      await getLevels({ page, limit, search });
    } catch (error) {
      message.error("Failed to fetch levels");
    }
  };

  React.useEffect(() => {
    fetchLevels(pagination.current, pagination.pageSize, searchText);
  }, [pagination.current, pagination.pageSize, searchText]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const showModal = (level = null) => {
    setEditingLevel(level);
    if (level) {
      form.setFieldsValue({
        id: level.id,
        name: level.nama,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingLevel(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await addLevel(values);
      message.success(
        `Jenjang berhasil ${editingLevel ? "diperbarui" : "ditambahkan"} `
      );
      setIsModalVisible(false);
      setEditingLevel(null);
      form.resetFields();
      fetchLevels(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      message.error(`Failed to ${editingLevel ? "update" : "add"} level`);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Apakah anda yakin ingin menghapus jenjang ini?",
      content: "Data jenjang akan dihapus secara permanen",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          const response = await delLevel(id);
          message.success(response.message);
          fetchLevels(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
          message.error(error.data?.message || "Failed to delete level");
        }
      },
    });
  };

  const columns = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Level Name",
      dataIndex: "nama",
      key: "nama",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout title="Jenjang">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="Search levels"
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add Level
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.levels}
        rowKey="id"
        pagination={{
          ...pagination,
          total: data?.totalPages * pagination.pageSize,
        }}
        loading={isLoading}
        onChange={handleTableChange}
      />

      <Modal
        title={editingLevel ? "Edit Level" : "Add Level"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          {editingLevel && (
            <Form.Item name="id" label="ID">
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="Level Name"
            rules={[{ required: true, message: "Please input level name!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminGrade;
