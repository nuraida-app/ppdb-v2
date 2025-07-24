import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  message,
  Row,
  Col,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useUploadPaymentMutation } from "../../../controller/api/payment/ApiPayment";

const PaymentForm = ({ user }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploadPayment, { isLoading }] = useUploadPaymentMutation();

  const onFinish = async (values) => {
    if (!fileList.length) {
      message.error("Bukti pembayaran harus diupload!");
      return;
    }
    const formData = new FormData();
    formData.append("nama", values.nama);
    formData.append("nominal", values.nominal);
    formData.append("media", values.media);
    formData.append("file", fileList[0].originFileObj);
    try {
      await uploadPayment(formData).unwrap();
      message.success("Data pembayaran berhasil disimpan!");
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error(error?.data?.message || "Gagal menyimpan pembayaran");
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Card title="Form Pembayaran">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          nama: user?.nama,
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="nama"
              label="Nama Calon Siswa"
              rules={[{ required: true, message: "Nama harus diisi!" }]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="nominal"
              label="Nominal Pembayaran"
              rules={[{ required: true, message: "Nominal harus diisi!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\Rp\s?|(,*)/g, "")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="media"
              label="Media Informasi"
              rules={[
                { required: true, message: "Media informasi harus diisi!" },
              ]}
            >
              <Select placeholder="Pilih Media Informasi">
                <Select.Option value="Website">Website</Select.Option>
                <Select.Option value="Instagram">Instagram</Select.Option>
                <Select.Option value="Facebook">Facebook</Select.Option>
                <Select.Option value="YouTube">YouTube</Select.Option>
                <Select.Option value="Radio">Radio</Select.Option>
                <Select.Option value="Kerabat">Kerabat</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="upload"
              label="Upload Bukti Pembayaran"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[
                {
                  required: true,
                  message: "Bukti pembayaran harus diupload!",
                },
              ]}
            >
              <Upload
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
                onChange={({ fileList }) => setFileList(fileList)}
              >
                <Button icon={<UploadOutlined />}>
                  Upload Bukti Pembayaran
                </Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Simpan Pembayaran
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PaymentForm;
