import React, { useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  message,
  Select,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useGetSchedulesQuery,
  useAddScheduleMutation,
  useDeleteScheduleMutation,
} from "../../../controller/api/admin/ApiSchedule";

const { Option } = Select;

const AdminSchedule = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetSchedulesQuery({ page, limit, search });
  const [addSchedule] = useAddScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      time: record.waktu,
      type: record.jenis,
      name: record.kegiatan,
      mode: record.mode,
      quota: record.kuota,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Hapus Jadwal",
      content: "Apakah Anda yakin ingin menghapus jadwal ini?",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          await deleteSchedule(id).unwrap();
          message.success("Jadwal berhasil dihapus");
        } catch (error) {
          message.error("Gagal menghapus jadwal");
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      const formattedData = {
        id: editingId,
        time: values.time,
        type: values.type,
        name: values.name,
        mode: values.mode,
        quota: values.quota,
      };
      await addSchedule(formattedData).unwrap();
      message.success(
        editingId ? "Jadwal berhasil diperbarui" : "Jadwal berhasil ditambahkan"
      );
      setIsModalOpen(false);
    } catch (error) {
      message.error("Gagal menyimpan jadwal");
    }
  };

  const columns = [
    {
      title: "Waktu",
      dataIndex: "waktu",
      key: "waktu",
      render: (text) => {
        const date = new Date(text);
        const days = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];
        const months = [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ];
        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        return `${dayName}, ${date.getDate()} ${monthName} ${date.getFullYear()}`;
      },
    },
    {
      title: "Jenis",
      dataIndex: "jenis",
      key: "jenis",
    },
    {
      title: "Kegiatan",
      dataIndex: "kegiatan",
      key: "kegiatan",
    },
    {
      title: "Mode",
      dataIndex: "mode",
      key: "mode",
    },
    {
      title: "Kuota",
      dataIndex: "kuota",
      key: "kuota",
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout title="Jadwal">
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Tambah Jadwal
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data?.schedules}
          loading={isLoading}
          rowKey="id"
          pagination={{
            total: data?.totalPages * limit,
            pageSize: limit,
            current: page,
            onChange: (page) => setPage(page),
          }}
        />

        <Modal
          title={editingId ? "Edit Jadwal" : "Tambah Jadwal"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="time"
              label="Waktu"
              rules={[{ required: true, message: "Waktu harus diisi" }]}
            >
              <Input type="datetime-local" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Jenis"
              rules={[{ required: true, message: "Jenis harus diisi" }]}
            >
              <Select placeholder="Pilih jenis kegiatan">
                <Option value="test">Test Tulis</Option>
                <Option value="mcu">MCU</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="name"
              label="Kegiatan"
              rules={[{ required: true, message: "Kegiatan harus diisi" }]}
            >
              <Input placeholder="Masukkan kegiatan" />
            </Form.Item>

            <Form.Item
              name="mode"
              label="Mode"
              rules={[{ required: true, message: "Mode harus diisi" }]}
            >
              <Select placeholder="Pilih mode">
                <Option value="offline">Offline</Option>
                <Option value="online">Online</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="quota"
              label="Kuota"
              rules={[{ required: true, message: "Kuota harus diisi" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingId ? "Update" : "Simpan"}
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>Batal</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminSchedule;
