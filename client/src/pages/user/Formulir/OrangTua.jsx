import React, { useEffect } from "react";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Button,
  message,
} from "antd";
import { useAddParentsMutation } from "../../../controller/api/form/ApiForm";
import dayjs from "dayjs";

const { Option } = Select;

const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  return phone.startsWith("0") ? "62" + phone.slice(1) : phone;
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = dayjs(dateString);
    return date.isValid() ? date : null;
  } catch (error) {
    return null;
  }
};

const OrangTua = ({ value, onChange, onSave }) => {
  const [form] = Form.useForm();
  const [addParents, { isLoading }] = useAddParentsMutation();

  useEffect(() => {
    if (value) {
      const formattedValues = {
        ...value,
        ayah_tanggal_lahir: formatDate(value.ayah_tanggal_lahir),
        ibu_tanggal_lahir: formatDate(value.ibu_tanggal_lahir),
      };
      form.setFieldsValue(formattedValues);
    }
  }, [value, form]);

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        ayah_tanggal_lahir: values.ayah_tanggal_lahir
          ? values.ayah_tanggal_lahir.format("YYYY-MM-DD")
          : null,
        ibu_tanggal_lahir: values.ibu_tanggal_lahir
          ? values.ibu_tanggal_lahir.format("YYYY-MM-DD")
          : null,
        ayah_no_tlp: formatPhoneNumber(values.ayah_no_tlp),
        ibu_no_tlp: formatPhoneNumber(values.ibu_no_tlp),
      };
      const userId = localStorage.getItem("userId");
      await addParents({ body: formattedValues, userId }).unwrap();
      message.success("Data orang tua berhasil disimpan");
      onSave(formattedValues);
    } catch (error) {
      message.error("Gagal menyimpan data orang tua");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={(_, allValues) => onChange(allValues)}
      onFinish={handleSubmit}
    >
      <h3>Data Ayah</h3>
      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ayah_nik"
            label="NIK Ayah"
            rules={[{ required: true, message: "NIK ayah harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ayah_nama"
            label="Nama Ayah"
            rules={[{ required: true, message: "Nama ayah harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ayah_tempat_lahir"
            label="Tempat Lahir Ayah"
            rules={[
              { required: true, message: "Tempat lahir ayah harus diisi" },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ayah_tanggal_lahir"
            label="Tanggal Lahir Ayah"
            rules={[
              { required: true, message: "Tanggal lahir ayah harus diisi" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              allowClear={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ayah_pendidikan"
            label="Pendidikan Ayah"
            rules={[{ required: true, message: "Pendidikan ayah harus diisi" }]}
          >
            <Select placeholder="Pilih Pendidikan">
              <Option value="SD">SD</Option>
              <Option value="SMP">SMP</Option>
              <Option value="SMA">SMA</Option>
              <Option value="D3">D3</Option>
              <Option value="S1">S1</Option>
              <Option value="S2">S2</Option>
              <Option value="S3">S3</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ayah_pekerjaan"
            label="Pekerjaan Ayah"
            rules={[{ required: true, message: "Pekerjaan ayah harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ayah_no_tlp"
            label="Nomor Telepon Ayah"
            rules={[
              { required: true, message: "Nomor telepon ayah harus diisi" },
            ]}
          >
            <Input placeholder="Contoh: 08123456789" />
          </Form.Item>
        </Col>
      </Row>

      <h3>Data Ibu</h3>
      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ibu_nik"
            label="NIK Ibu"
            rules={[{ required: true, message: "NIK ibu harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ibu_nama"
            label="Nama Ibu"
            rules={[{ required: true, message: "Nama ibu harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ibu_tempat_lahir"
            label="Tempat Lahir Ibu"
            rules={[
              { required: true, message: "Tempat lahir ibu harus diisi" },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ibu_tanggal_lahir"
            label="Tanggal Lahir Ibu"
            rules={[
              { required: true, message: "Tanggal lahir ibu harus diisi" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              allowClear={true}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ibu_pendidikan"
            label="Pendidikan Ibu"
            rules={[{ required: true, message: "Pendidikan ibu harus diisi" }]}
          >
            <Select placeholder="Pilih Pendidikan">
              <Option value="SD">SD</Option>
              <Option value="SMP">SMP</Option>
              <Option value="SMA">SMA</Option>
              <Option value="D3">D3</Option>
              <Option value="S1">S1</Option>
              <Option value="S2">S2</Option>
              <Option value="S3">S3</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ibu_pekerjaan"
            label="Pekerjaan Ibu"
            rules={[{ required: true, message: "Pekerjaan ibu harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="ibu_no_tlp"
            label="Nomor Telepon Ibu"
            rules={[
              { required: true, message: "Nomor telepon ibu harus diisi" },
            ]}
          >
            <Input placeholder="Contoh: 08123456789" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Simpan
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OrangTua;
