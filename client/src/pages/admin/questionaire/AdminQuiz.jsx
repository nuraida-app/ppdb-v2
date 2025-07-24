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
  useGetQuizzesQuery,
  useAddQuizMutation,
  useDeleteQuizMutation,
} from "../../../controller/api/quiz/ApiQuiz";
import Editor from "../Editor/Editor";

const { Option } = Select;

const createMarkup = (html) => {
  return { __html: html };
};

const AdminQuiz = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data, isLoading, refetch } = useGetQuizzesQuery({
    page: pagination.current,
    limit: pagination.pageSize,
    search: searchText,
  });

  const [addQuiz] = useAddQuizMutation();
  const [deleteQuiz] = useDeleteQuizMutation();

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const showModal = (quiz = null) => {
    setEditingQuiz(quiz);
    if (quiz) {
      form.setFieldsValue({
        id: quiz.id,
        question: quiz.soal,
        type: quiz.jenis,
        input: quiz.pengisi,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingQuiz(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await addQuiz(values);
      message.success(
        `Pertanyaan berhasil ${editingQuiz ? "diperbarui" : "ditambahkan"}`
      );
      setIsModalVisible(false);
      setEditingQuiz(null);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error(
        `Gagal ${editingQuiz ? "memperbarui" : "menambahkan"} pertanyaan`
      );
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Apakah anda yakin ingin menghapus pertanyaan ini?",
      content: "Data pertanyaan akan dihapus secara permanen",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: async () => {
        try {
          const response = await deleteQuiz(id);
          message.success(response.message);
          refetch();
        } catch (error) {
          message.error(error.data?.message || "Gagal menghapus pertanyaan");
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
      title: "Pertanyaan",
      dataIndex: "soal",
      key: "soal",
      render: (text) => <div dangerouslySetInnerHTML={createMarkup(text)} />,
    },
    {
      title: "Jenis",
      dataIndex: "jenis",
      key: "jenis",
    },
    {
      title: "Pengisi",
      dataIndex: "pengisi",
      key: "pengisi",
      render: (text) => (text === "ortu" ? "Orang Tua" : "Calon Peserta Didik"),
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
    <AdminLayout title="Kuisioner">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search
            placeholder="Cari pertanyaan"
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Tambah Pertanyaan
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.questions}
        rowKey="id"
        pagination={{
          ...pagination,
          total: data?.totalPages * pagination.pageSize,
        }}
        loading={isLoading}
        onChange={handleTableChange}
      />

      <Modal
        title={editingQuiz ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">
          {editingQuiz && (
            <Form.Item name="id" label="ID">
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            name="type"
            label="Jenis"
            rules={[{ required: true, message: "Silakan pilih jenis!" }]}
          >
            <Select placeholder="Pilih jenis">
              <Option value="Kuisioner">Kuisioner</Option>
              <Option value="Angket">Angket</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="input"
            label="Pengisi"
            rules={[{ required: true, message: "Silakan pilih pengisi!" }]}
          >
            <Select placeholder="Pilih pengisi">
              <Option value="ortu">Orang Tua</Option>
              <Option value="Calon Peserta Didik">Calon Peserta Didik</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="question"
            label="Pertanyaan"
            rules={[
              { required: true, message: "Silakan masukkan pertanyaan!" },
            ]}
          >
            <Editor />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminQuiz;
