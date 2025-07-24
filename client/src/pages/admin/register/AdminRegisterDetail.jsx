import React from "react";
import { Card, Descriptions, Space, Typography, Button, Tabs } from "antd";
import { useGetFormQuery } from "../../../controller/api/form/ApiForm";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";
import PrintPage from "./PrintPage";
import AnswerPage from "./AnswerPage";
import LoadingComponent from "../../components/LoadingComponent";

const { Title } = Typography;

const AdminRegisterDetail = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { data: formData, isLoading } = useGetFormQuery(userId);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!formData) {
    return (
      <AdminLayout>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={4} type="danger">
            Data tidak ditemukan
          </Title>
        </Space>
      </AdminLayout>
    );
  }

  const { formulir, documents, address, school, families } = formData;

  return (
    <AdminLayout title={`Detail Pendaftar ${formulir.nama}`}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Title level={4}>Detail Pendaftar</Title>
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: "Data Diri",
                  children: (
                    <Descriptions bordered>
                      <Descriptions.Item label="Kode Pendaftaran" span={3}>
                        {formulir.kode_pendaftaran}
                      </Descriptions.Item>
                      <Descriptions.Item label="Status Pendaftaran" span={3}>
                        {formulir.status_pendaftaran}
                      </Descriptions.Item>
                      <Descriptions.Item label="Nama" span={3}>
                        {formulir.nama}
                      </Descriptions.Item>
                      <Descriptions.Item label="NISN">
                        {formulir.nisn}
                      </Descriptions.Item>
                      <Descriptions.Item label="NIK">
                        {formulir.nik}
                      </Descriptions.Item>
                      <Descriptions.Item label="No. KK">
                        {formulir.no_kk}
                      </Descriptions.Item>
                      <Descriptions.Item label="No. Akta">
                        {formulir.no_akta}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tempat Lahir">
                        {formulir.tempat_lahir}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tanggal Lahir">
                        {new Date(formulir.tanggal_lahir).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Jenis Kelamin">
                        {formulir.kelamin == "m" ? "Laki-laki" : "Perempuan"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Agama">
                        {formulir.agama}
                      </Descriptions.Item>
                      <Descriptions.Item label="Anak Ke">
                        {formulir.anak_ke}
                      </Descriptions.Item>
                      <Descriptions.Item label="Jumlah Saudara">
                        {formulir.jml_saudara}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tinggi Badan">
                        {formulir.tinggi} cm
                      </Descriptions.Item>
                      <Descriptions.Item label="Berat Badan">
                        {formulir.berat} kg
                      </Descriptions.Item>
                      <Descriptions.Item label="Lingkar Kepala">
                        {formulir.kepala} cm
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "2",
                  label: "Data Orang Tua",
                  children: (
                    <Descriptions bordered>
                      <Descriptions.Item label="Nama Ayah" span={3}>
                        {formulir.ayah_nama}
                      </Descriptions.Item>
                      <Descriptions.Item label="NIK Ayah">
                        {formulir.ayah_nik}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tempat Lahir Ayah">
                        {formulir.ayah_tempat_lahir}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tanggal Lahir Ayah">
                        {new Date(
                          formulir.ayah_tanggal_lahir
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Descriptions.Item>
                      <Descriptions.Item label="Pendidikan Ayah"></Descriptions.Item>
                      <Descriptions.Item label="Pekerjaan Ayah">
                        {formulir.ayah_pekerjaan}
                      </Descriptions.Item>
                      <Descriptions.Item label="No. Telepon Ayah">
                        {formulir.ayah_no_tlp}
                      </Descriptions.Item>

                      <Descriptions.Item label="Nama Ibu" span={3}>
                        {formulir.ibu_nama}
                      </Descriptions.Item>
                      <Descriptions.Item label="NIK Ibu">
                        {formulir.ibu_nik}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tempat Lahir Ibu">
                        {formulir.ibu_tempat_lahir}
                      </Descriptions.Item>
                      <Descriptions.Item label="Tanggal Lahir Ibu">
                        {new Date(
                          formulir.ibu_tanggal_lahir
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </Descriptions.Item>
                      <Descriptions.Item label="Pendidikan Ibu">
                        {formulir.ibu_pendidikan}
                      </Descriptions.Item>
                      <Descriptions.Item label="Pekerjaan Ibu">
                        {formulir.ibu_pekerjaan}
                      </Descriptions.Item>
                      <Descriptions.Item label="No. Telepon Ibu">
                        {formulir.ibu_no_tlp}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "3",
                  label: "Data Alamat",
                  children: address && (
                    <Descriptions bordered>
                      <Descriptions.Item label="Alamat" span={3}>
                        {address.alamat}
                      </Descriptions.Item>
                      <Descriptions.Item label="Desa/Kelurahan">
                        {address.desa}
                      </Descriptions.Item>
                      <Descriptions.Item label="Kecamatan">
                        {address.kecamatan}
                      </Descriptions.Item>
                      <Descriptions.Item label="Kota/Kabupaten">
                        {address.kota}
                      </Descriptions.Item>
                      <Descriptions.Item label="Provinsi">
                        {address.provinsi}
                      </Descriptions.Item>
                      <Descriptions.Item label="Kode Pos">
                        {address.kode_pos}
                      </Descriptions.Item>
                      <Descriptions.Item label="Jarak ke Sekolah">
                        {address.jarak} km
                      </Descriptions.Item>
                      <Descriptions.Item label="Transportasi">
                        {address.transportasi}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "4",
                  label: "Asal Sekolah",
                  children: school && (
                    <Descriptions bordered>
                      <Descriptions.Item label="Nama Sekolah" span={3}>
                        {school.nama}
                      </Descriptions.Item>
                      <Descriptions.Item label="NPSN">
                        {school.npsn}
                      </Descriptions.Item>
                      <Descriptions.Item label="Desa/Kelurahan">
                        {school.desa}
                      </Descriptions.Item>
                      <Descriptions.Item label="Kecamatan">
                        {school.kecamatan}
                      </Descriptions.Item>
                      <Descriptions.Item label="Kota/Kabupaten">
                        {school.kota}
                      </Descriptions.Item>
                      <Descriptions.Item label="Provinsi">
                        {school.provinsi}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: "5",
                  label: "Data Keluarga",
                  children:
                    families && families.length > 0 ? (
                      <Space direction="vertical" style={{ width: "100%" }}>
                        {families.map((family) => (
                          <Card key={`family-${family.id}`} size="small">
                            <Descriptions bordered>
                              <Descriptions.Item label="Nama">
                                {family.nama}
                              </Descriptions.Item>
                              <Descriptions.Item label="Tanggal Lahir">
                                {new Date(
                                  family.tanggal_lahir
                                ).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        ))}
                      </Space>
                    ) : (
                      <Typography.Text>Belum ada data keluarga</Typography.Text>
                    ),
                },
                {
                  key: "6",
                  label: "Berkas",
                  children: (
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      {documents?.map((doc) => (
                        <Card key={`doc-${doc.id}`} size="small">
                          <Space>
                            <Typography.Text strong>
                              {doc.file_name}
                            </Typography.Text>
                            <Button
                              type="link"
                              href={doc.file_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Lihat Berkas
                            </Button>
                          </Space>
                        </Card>
                      ))}
                    </Space>
                  ),
                },
                {
                  key: "7",
                  label: "Print",
                  children: <PrintPage />,
                },
                {
                  key: "8",
                  label: "Jawaban",
                  children: <AnswerPage />,
                },
              ]}
            />
          </Space>
        </Card>

        <Button onClick={() => navigate(-1)}>Kembali</Button>
      </Space>
    </AdminLayout>
  );
};

export default AdminRegisterDetail;
