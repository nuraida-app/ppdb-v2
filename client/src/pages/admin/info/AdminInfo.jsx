import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Form,
  message,
  Select,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import AdminLayout from "../Layout/AdminLayout";
import {
  useGetInfosQuery,
  useAddInfoMutation,
  useDeleteInfoMutation,
} from "../../../controller/api/admin/ApiInfo";
import Editor from "../Editor/Editor";

const { Option } = Select;

const AdminInfo = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editingInfo, setEditingInfo] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data, isLoading, refetch } = useGetInfosQuery({
    page: pagination.current,
    limit: pagination.pageSize,
    search: searchText,
  });

  const [addInfo] = useAddInfoMutation();
  const [deleteInfo] = useDeleteInfoMutation();

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const showModal = (info = null) => {
    setEditingInfo(info);
    if (info) {
      form.setFieldsValue({
        id: info.id,
        title: info.judul,
        category: info.kategori,
        value: info.teks,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingInfo(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await addInfo(values);
      message.success(
        `Informasi berhasil ${editingInfo ? "diperbarui" : "ditambahkan"}`
      );
      setIsModalVisible(false);
      setEditingInfo(null);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error(
        `Gagal ${editingInfo ? "memperbarui" : "menambahkan"} informasi`
      );
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Apakah anda yakin ingin menghapus informasi ini?",
      content: "Data informasi akan dihapus secara permanen",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          const response = await deleteInfo(id);
          message.success(response.message);
          refetch();
        } catch (error) {
          message.error(error.data?.message || "Gagal menghapus informasi");
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
      title: "Judul",
      dataIndex: "judul",
      key: "judul",
    },
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
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
    <AdminLayout title="Informasi">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="Cari informasi"
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Tambah Informasi
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.infos}
        rowKey="id"
        pagination={{
          ...pagination,
          total: data?.totalPages * pagination.pageSize,
        }}
        loading={isLoading}
        onChange={handleTableChange}
      />

      <Modal
        title={editingInfo ? "Edit Informasi" : "Tambah Informasi"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">
          {editingInfo && (
            <Form.Item name="id" label="ID">
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            name="title"
            label="Judul"
            rules={[{ required: true, message: "Silakan masukkan judul!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Kategori"
            rules={[{ required: true, message: "Silakan pilih kategori!" }]}
          >
            <Select placeholder="Pilih kategori">
              <Option value="Pembayaran">Pembayaran</Option>
              <Option value="Pengumuman">Pengumuman</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="value"
            label="Konten"
            rules={[{ required: true, message: "Silakan masukkan konten!" }]}
          >
            <Editor />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminInfo;
