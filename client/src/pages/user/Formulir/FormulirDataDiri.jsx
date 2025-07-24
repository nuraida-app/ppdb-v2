import React, { useEffect } from "react";
import {
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Row,
  Col,
  Button,
  message,
} from "antd";
import { useAddStudentFormMutation } from "../../../controller/api/form/ApiForm";
import { useGetYearsQuery } from "../../../controller/api/admin/ApiPeriode";
import { useGetSchoolsMutation } from "../../../controller/api/admin/ApiSchool";
import { useGetLevelsMutation } from "../../../controller/api/admin/ApiGrade";
import dayjs from "dayjs";

const { Option } = Select;

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return dayjs(date);
};

const FormulirDataDiri = ({ value, onChange, onSave }) => {
  const [form] = Form.useForm();

  const { data: years } = useGetYearsQuery();
  const [getSchools, { data }] = useGetSchoolsMutation();
  const { schools = [] } = data || {};
  const [getLevels, { data: levelData }] = useGetLevelsMutation();

  const [addStudentForm, { isLoading }] = useAddStudentFormMutation();

  const fetchSchool = async () => {
    try {
      await getSchools({ page: "", limit: "", search: "" });
    } catch (error) {
      message.error("Gagal mengambil data sekolah");
    }
  };

  const fetchLevel = async () => {
    try {
      await getLevels({ page: "", limit: "", search: "" });
    } catch (error) {
      message.error("Gagal mengambil data jenjang");
    }
  };

  useEffect(() => {
    fetchSchool();
    fetchLevel();
  }, []);

  useEffect(() => {
    if (value) {
      form.setFieldsValue({
        ...value,
        tanggal_lahir: value.tanggal_lahir
          ? formatDate(value.tanggal_lahir)
          : null,
      });
    }
  }, [value, form]);

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        tanggal_lahir: values.tanggal_lahir
          ? values.tanggal_lahir.format("YYYY-MM-DD")
          : null,
      };
      const userId = localStorage.getItem("userId");
      await addStudentForm({ body: formattedValues, userId }).unwrap();
      message.success("Data diri berhasil disimpan");
      onSave(formattedValues);
    } catch (error) {
      message.error("Gagal menyimpan data diri");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={(_, allValues) => onChange(allValues)}
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="tapel" label="Tahun Pelajaran">
            <Select placeholder="Pilih Tahun Pelajaran">
              {years?.map((year) => (
                <Option key={year.id} value={year.id}>
                  {year.tapel}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="jenjang" label="Jenjang">
            <Select placeholder="Pilih Jenjang">
              {levelData?.map((level) => (
                <Option key={level.id} value={level.id}>
                  {level.nama}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="sekolah" label="Sekolah">
            <Select placeholder="Pilih Sekolah">
              {schools?.map((school) => (
                <Option key={school.id} value={school.id}>
                  {school.nama}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="nisn" label="NISN">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="no_kk" label="Nomor KK">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="nik" label="NIK">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="no_akta" label="Nomor Akta">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="nama_lengkap" label="Nama Lengkap">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="tempat_lahir" label="Tempat Lahir">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="tanggal_lahir" label="Tanggal Lahir">
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="kelamin" label="Jenis Kelamin">
            <Select placeholder="Pilih Jenis Kelamin">
              <Option value="m">Laki-laki</Option>
              <Option value="f">Perempuan</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="agama" label="Agama">
            <Select placeholder="Pilih Agama">
              <Option value="Islam">Islam</Option>
              <Option value="Kristen">Kristen</Option>
              <Option value="Katolik">Katolik</Option>
              <Option value="Hindu">Hindu</Option>
              <Option value="Buddha">Buddha</Option>
              <Option value="Konghucu">Konghucu</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="anak_ke" label="Anak Ke">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="jml_saudara" label="Jumlah Saudara">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="tb" label="Tinggi Badan (cm)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="bb" label="Berat Badan (kg)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="lingkar_kepala" label="Lingkar Kepala (cm)">
            <InputNumber min={0} style={{ width: "100%" }} />
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

export default FormulirDataDiri;
