import React, { useRef } from "react";
import { Typography, Space, Divider, Image, Button } from "antd";
import { useGetFormQuery } from "../../../controller/api/form/ApiForm";
import { useParams } from "react-router-dom";
import { CloudDownloadOutlined } from "@ant-design/icons";
import LoadingComponent from "../../components/LoadingComponent";

import html2pdf from "html2pdf.js";

const { Title, Text } = Typography;

const PrintPage = () => {
  const { userId } = useParams();
  const { data: formData, isLoading } = useGetFormQuery(userId);

  console.log(formData);

  if (isLoading || !formData) {
    return <LoadingComponent />;
  }

  const { formulir, address, school, documents } = formData;

  const foto = documents.find((doc) => doc.file_name === "Foto");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const LabelValue = ({ label, value }) => (
    <div className="label-value-row" style={{ marginBottom: "4px" }}>
      <Text style={{ display: "inline-block", width: "140px" }}>{label}</Text>
      <Text strong>: {value}</Text>
    </div>
  );

  const exportToPDF = () => {
    const element = document.querySelector(".print-content");
    const opt = {
      margin: 0.5,
      filename: `Formulir-Pendaftaran-${formulir.nama}.pdf`,
      image: { type: "png", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <>
      <div
        className="no-print"
        style={{ textAlign: "right", marginBottom: "20px" }}
      >
        <Button
          type="primary"
          icon={<CloudDownloadOutlined />}
          onClick={exportToPDF}
        >
          Export ke PDF
        </Button>
      </div>
      <div
        className="print-content"
        style={{
          width: "100%",
          maxWidth: "210mm",
          margin: "0 auto",
          padding: "20px",
          background: "white",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "8px", marginTop: 0 }}>
          <Title level={3} style={{ marginBottom: 30 }}>
            FORMULIR PENDAFTARAN PESERTA DIDIK BARU
          </Title>
        </div>
        <div className="section-content section-avoid-break">
          <Title level={4}>A. DATA PENDAFTARAN</Title>
          <div style={{ paddingLeft: "20px" }}>
            <LabelValue
              label="Kode Pendaftaran"
              value={formulir.kode_pendaftaran}
            />
            <LabelValue
              label="Status Pendaftaran"
              value={formulir.status_pendaftaran}
            />
            <LabelValue label="Sekolah" value={formulir.sekolah} />
            <LabelValue label="Jenjang" value={formulir.jenjang} />
          </div>
        </div>
        <Divider />
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Data Pribadi */}
          <div className="section-content section-avoid-break">
            <Title level={4}>B. DATA PRIBADI</Title>
            <div style={{ paddingLeft: "10px", display: "flex", gap: "16px" }}>
              {/* Data Pribadi */}
              <div style={{ flex: 1 }}>
                <LabelValue label="Nama Lengkap" value={formulir.nama} />
                <LabelValue label="NISN" value={formulir.nisn} />
                <LabelValue label="NIK" value={formulir.nik} />
                <LabelValue label="No. KK" value={formulir.no_kk} />
                <LabelValue label="No. Akta" value={formulir.no_akta} />
                <LabelValue
                  label="Tempat Lahir"
                  value={formulir.tempat_lahir}
                />
                <LabelValue
                  label="Tanggal Lahir"
                  value={formatDate(formulir.tanggal_lahir)}
                />
                <LabelValue
                  label="Jenis Kelamin"
                  value={formulir.kelamin === "m" ? "Laki-laki" : "Perempuan"}
                />
                <LabelValue label="Agama" value={formulir.agama} />
                <LabelValue label="Anak Ke" value={formulir.anak_ke} />
                <LabelValue
                  label="Jumlah Saudara"
                  value={formulir.jml_saudara}
                />
                <LabelValue
                  label="Tinggi Badan"
                  value={`${formulir.tinggi} cm`}
                />
                <LabelValue
                  label="Berat Badan"
                  value={`${formulir.berat} kg`}
                />
                <LabelValue
                  label="Lingkar Kepala"
                  value={`${formulir.kepala} cm`}
                />
              </div>

              {/* Foto */}
              <div
                style={{
                  width: "2.5cm",
                  height: "3.3cm",
                  border: "1px solid #000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fff",
                  marginTop: "4px",
                }}
              >
                {foto ? (
                  <img
                    src={foto.file_link}
                    alt="Foto Siswa"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <Text type="secondary">Foto 3x4</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      (3x4 cm)
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Divider />

          {/* Data Orang Tua */}
          <div className="section-content section-avoid-break">
            <Title level={4}>C. DATA ORANG TUA</Title>
            <div style={{ paddingLeft: "10px" }}>
              <div style={{ display: "flex", gap: "16px" }}>
                {/* Data Ayah */}
                <div style={{ flex: 1 }}>
                  <Title level={5}>Data Ayah</Title>
                  <div style={{ paddingLeft: "20px" }}>
                    <LabelValue label="Nama Ayah" value={formulir.ayah_nama} />
                    <LabelValue label="NIK Ayah" value={formulir.ayah_nik} />
                    <LabelValue
                      label="Tempat Lahir"
                      value={formulir.ayah_tempat_lahir}
                    />
                    <LabelValue
                      label="Tanggal Lahir"
                      value={formatDate(formulir.ayah_tanggal_lahir)}
                    />
                    <LabelValue
                      label="Pendidikan"
                      value={formulir.ayah_pendidikan}
                    />
                    <LabelValue
                      label="Pekerjaan"
                      value={formulir.ayah_pekerjaan}
                    />
                    <LabelValue
                      label="No. Telepon"
                      value={formulir.ayah_no_tlp}
                    />
                  </div>
                </div>

                {/* Data Ibu */}
                <div style={{ flex: 1 }}>
                  <Title level={5}>Data Ibu</Title>
                  <div style={{ paddingLeft: "20px" }}>
                    <LabelValue label="Nama Ibu" value={formulir.ibu_nama} />
                    <LabelValue label="NIK Ibu" value={formulir.ibu_nik} />
                    <LabelValue
                      label="Tempat Lahir"
                      value={formulir.ibu_tempat_lahir}
                    />
                    <LabelValue
                      label="Tanggal Lahir"
                      value={formatDate(formulir.ibu_tanggal_lahir)}
                    />
                    <LabelValue
                      label="Pendidikan"
                      value={formulir.ibu_pendidikan}
                    />
                    <LabelValue
                      label="Pekerjaan"
                      value={formulir.ibu_pekerjaan}
                    />
                    <LabelValue
                      label="No. Telepon"
                      value={formulir.ibu_no_tlp}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Data Alamat */}
          <div className="section-content section-avoid-break">
            <Title level={4}>D. DATA ALAMAT</Title>
            <div style={{ paddingLeft: "10px" }}>
              <LabelValue label="Alamat" value={address?.alamat} />
              <LabelValue label="Desa/Kelurahan" value={address?.desa} />
              <LabelValue label="Kecamatan" value={address?.kecamatan} />
              <LabelValue label="Kota/Kabupaten" value={address?.kota} />
              <LabelValue label="Provinsi" value={address?.provinsi} />
              <LabelValue label="Kode Pos" value={address?.kode_pos} />
              <LabelValue
                label="Jarak ke Sekolah"
                value={`${address?.jarak} km`}
              />
              <LabelValue label="Transportasi" value={address?.transportasi} />
            </div>
          </div>

          <Divider />

          {/* Data Sekolah Asal */}
          <div className="section-content section-avoid-break">
            <Title level={4}>E. DATA SEKOLAH ASAL</Title>
            <div style={{ paddingLeft: "10px" }}>
              <LabelValue label="Nama Sekolah" value={school?.nama} />
              <LabelValue label="NPSN" value={school?.npsn} />
              <LabelValue label="Desa/Kelurahan" value={school?.desa} />
              <LabelValue label="Kecamatan" value={school?.kecamatan} />
              <LabelValue label="Kota/Kabupaten" value={school?.kota} />
              <LabelValue label="Provinsi" value={school?.provinsi} />
            </div>
          </div>
        </Space>
      </div>
    </>
  );
};

export default PrintPage;
