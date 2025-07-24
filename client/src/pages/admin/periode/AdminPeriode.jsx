import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import {
  useGetYearsQuery,
  useAddYearMutation,
  useDeleteYearMutation,
} from "../../../controller/api/admin/ApiPeriode";
import { Button, Table, Modal, Form, Input, Space, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useDownloadFormMutation } from "../../../controller/api/form/ApiForm";

const AdminPeriode = () => {
  const { data: periods = [], isLoading } = useGetYearsQuery();
  const [addYear] = useAddYearMutation();
  const [deleteYear] = useDeleteYearMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [downloadTapel, setDownloadTapel] = useState(null);
  const [downloadForm, { isSuccess, isLoading: isDownloading }] =
    useDownloadFormMutation();

  const showModal = (period = null) => {
    if (period) {
      form.setFieldsValue({ name: period.tapel });
      setEditingId(period.id);
    } else {
      form.resetFields();
      setEditingId(null);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const response = await addYear({
        id: editingId,
        name: values.name,
      }).unwrap();
      message.success(response.message);
      handleCancel();
    } catch (error) {
      console.error("Error adding/updating period:", error);
      message.error(
        error.data?.message || "Terjadi kesalahan saat menyimpan data"
      );
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Konfirmasi Hapus",
      content: "Apakah Anda yakin ingin menghapus periode ini?",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          const response = await deleteYear(id).unwrap();
          message.success(response.message);
        } catch (error) {
          console.error("Error deleting period:", error);
          message.error(
            error.data?.message || "Terjadi kesalahan saat menghapus data"
          );
        }
      },
    });
  };

  const handleDownload = (id, tapelname) => {
    setDownloadTapel(id);
    downloadForm({ tapel: id, tapelname });
  };

  useEffect(() => {
    if (isSuccess) {
      message.success("File berhasil didownload");
    }
  }, [isSuccess]);

  const columns = [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Periode",
      dataIndex: "tapel",
      key: "tapel",
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={isDownloading && downloadTapel === record.id}
            onClick={() => handleDownload(record.id, record.tapel)}
          />
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout title="Periode">
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Periode">
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => showModal()}>
          Tambah Periode
        </Button>
      </div>

      <Table
        dataSource={periods}
        columns={columns}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={editingId ? "Edit Periode" : "Tambah Periode"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingId ? "Update" : "Tambah"}
        cancelText="Batal"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nama Periode"
            rules={[{ required: true, message: "Nama periode harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminPeriode;
