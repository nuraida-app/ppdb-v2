import React from "react";
import { Form, Input, Row, Col, Button, message } from "antd";
import { useAddSchoolMutation } from "../../../controller/api/form/ApiForm";

const AsalSekolah = ({ value, onChange, onSave }) => {
  const [form] = Form.useForm();
  const [addSchool, { isLoading }] = useAddSchoolMutation();

  const handleSubmit = async (values) => {
    try {
      await addSchool(values).unwrap();
      message.success("Data asal sekolah berhasil disimpan");
      onSave(values);
    } catch (error) {
      message.error("Gagal menyimpan data asal sekolah");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={value}
      onValuesChange={(_, allValues) => onChange(allValues)}
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12}>
          <Form.Item
            name="nama"
            label="Nama Sekolah"
            rules={[{ required: true, message: "Nama sekolah harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Form.Item
            name="npsn"
            label="NPSN"
            rules={[{ required: true, message: "NPSN harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="provinsi"
            label="Provinsi"
            rules={[{ required: true, message: "Provinsi harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="kota"
            label="Kota/Kabupaten"
            rules={[{ required: true, message: "Kota/Kabupaten harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="kecamatan"
            label="Kecamatan"
            rules={[{ required: true, message: "Kecamatan harus diisi" }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            name="desa"
            label="Desa/Kelurahan"
            rules={[{ required: true, message: "Desa/Kelurahan harus diisi" }]}
          >
            <Input />
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

export default AsalSekolah;
