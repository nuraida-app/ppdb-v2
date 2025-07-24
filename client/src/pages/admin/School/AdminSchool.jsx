import React, { useState } from "react";
import { Table, Input, Button, Space, Modal, Form, message } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import AdminLayout from "../Layout/AdminLayout";
import {
  useGetSchoolsMutation,
  useAddSchoolMutation,
  useDelSchoolMutation,
} from "../../../controller/api/admin/ApiSchool";

const AdminSchool = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editingSchool, setEditingSchool] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [getSchools, { data, isLoading }] = useGetSchoolsMutation();
  const [addSchool] = useAddSchoolMutation();
  const [delSchool] = useDelSchoolMutation();

  const fetchSchools = async (page = 1, limit = 10, search = "") => {
    try {
      await getSchools({ page, limit, search });
    } catch (error) {
      message.error("Failed to fetch schools");
    }
  };

  React.useEffect(() => {
    fetchSchools(pagination.current, pagination.pageSize, searchText);
  }, [pagination.current, pagination.pageSize, searchText]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const showModal = (school = null) => {
    setEditingSchool(school);
    if (school) {
      form.setFieldsValue({
        id: school.id,
        name: school.nama,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingSchool(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await addSchool(values);
      message.success(
        `School ${editingSchool ? "updated" : "added"} successfully`
      );
      setIsModalVisible(false);
      setEditingSchool(null);
      form.resetFields();
      fetchSchools(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      message.error(`Failed to ${editingSchool ? "update" : "add"} school`);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Apakah anda yakin ingin menghapus sekolah ini?",
      content: "Data sekolah akan dihapus secara permanen",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          const response = await delSchool(id);
          message.success(response.message);
          fetchSchools(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
          message.error(error.data?.message || "Failed to delete school");
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
      title: "School Name",
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
    <AdminLayout title="Sekolah">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="Search schools"
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Add School
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.schools}
        rowKey="id"
        pagination={{
          ...pagination,
          total: data?.totalPages * pagination.pageSize,
        }}
        loading={isLoading}
        onChange={handleTableChange}
      />

      <Modal
        title={editingSchool ? "Edit School" : "Add School"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          {editingSchool && (
            <Form.Item name="id" label="ID">
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="School Name"
            rules={[{ required: true, message: "Please input school name!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminSchool;
