import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Row,
  Col,
  Button,
  message,
  Tabs,
  Spin,
} from "antd";
import UserLayout from "../Layout/UserLayout";
import FormulirDataDiri from "./FormulirDataDiri";
import OrangTua from "./OrangTua";
import Alamat from "./Alamat";
import AsalSekolah from "./AsalSekolah";
import Keluarga from "./Keluarga";
import Berkas from "./Berkas";
import PaymentRequired from "../../components/PaymentRequired";
import { useGetFormQuery } from "../../../controller/api/form/ApiForm";
import { useSelector } from "react-redux";
import { useMyPaymentQuery } from "../../../controller/api/payment/ApiPayment";

const { Option } = Select;

const Formulir = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: payment, isLoading: isLoadingPayment } = useMyPaymentQuery(
    user?.id,
    {
      skip: !user?.id,
    }
  );
  const userId = user?.id;

  const {
    data: formData,
    isLoading: isLoadingForm,
    error,
  } = useGetFormQuery(userId, {
    skip: !userId,
  });

  // State for form sections
  const [formSections, setFormSections] = useState({
    dataDiri: {},
    dataOrangTua: {},
    alamat: {},
    asalSekolah: {},
    keluarga: {},
  });

  // Update form sections when data is fetched
  useEffect(() => {
    if (formData?.formulir) {
      setFormSections({
        dataDiri: {
          tapel: formData.formulir.tapel_id,
          jenjang: formData.formulir.jenjang_id,
          sekolah: formData.formulir.sekolah_id,
          nisn: formData.formulir.nisn,
          no_kk: formData.formulir.no_kk,
          nik: formData.formulir.nik,
          no_akta: formData.formulir.no_akta,
          nama_lengkap: formData.formulir.nama,
          tempat_lahir: formData.formulir.tempat_lahir,
          tanggal_lahir: formData.formulir.tanggal_lahir,
          kelamin: formData.formulir.kelamin,
          agama: formData.formulir.agama,
          anak_ke: formData.formulir.anak_ke,
          jml_saudara: formData.formulir.jml_saudara,
          tb: formData.formulir.tinggi,
          bb: formData.formulir.berat,
          lingkar_kepala: formData.formulir.kepala,
        },
        dataOrangTua: {
          ayah_nik: formData.formulir.ayah_nik,
          ayah_nama: formData.formulir.ayah_nama,
          ayah_tempat_lahir: formData.formulir.ayah_tempat_lahir,
          ayah_tanggal_lahir: formData.formulir.ayah_tanggal_lahir,
          ayah_pendidikan: formData.formulir.ayah_pendidikan,
          ayah_pekerjaan: formData.formulir.ayah_pekerjaan,
          ayah_no_tlp: formData.formulir.ayah_no_tlp,
          ibu_nik: formData.formulir.ibu_nik,
          ibu_nama: formData.formulir.ibu_nama,
          ibu_tempat_lahir: formData.formulir.ibu_tempat_lahir,
          ibu_tanggal_lahir: formData.formulir.ibu_tanggal_lahir,
          ibu_pendidikan: formData.formulir.ibu_pendidikan,
          ibu_pekerjaan: formData.formulir.ibu_pekerjaan,
          ibu_no_tlp: formData.formulir.ibu_no_tlp,
        },
        alamat: formData.address || {},
        asalSekolah: formData.school || {},
        keluarga: formData.families || [],
      });
    }
  }, [formData]);

  // Handler untuk update data dari setiap bagian
  const handleSectionChange = (section, values) => {
    setFormSections((prev) => ({ ...prev, [section]: values }));
  };

  // Handler simpan per bagian
  const handleSectionSave = (section, values) => {
    message.success(`Data ${section} berhasil disimpan!`);
    console.log(`Data ${section}:`, values);
  };

  if (isLoadingPayment || isLoadingForm) {
    return (
      <UserLayout title="Formulir">
        <Card>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p style={{ marginTop: "20px" }}>Loading data...</p>
          </div>
        </Card>
      </UserLayout>
    );
  }

  // Show payment required message if payment is not completed
  if (!payment?.ket) {
    return (
      <UserLayout title="Formulir">
        <PaymentRequired />
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Formulir">
      <Card title="Formulir Pendaftaran">
        <Tabs
          defaultActiveKey="dataDiri"
          items={[
            {
              key: "dataDiri",
              label: "Data Diri",
              children: (
                <FormulirDataDiri
                  value={formSections.dataDiri}
                  onChange={(values) => handleSectionChange("dataDiri", values)}
                  onSave={(values) => handleSectionSave("Data Diri", values)}
                />
              ),
            },
            {
              key: "dataOrangTua",
              label: "Data Orang Tua",
              children: (
                <OrangTua
                  value={formSections?.dataOrangTua}
                  onChange={(values) =>
                    handleSectionChange("dataOrangTua", values)
                  }
                  onSave={(values) =>
                    handleSectionSave("Data Orang Tua", values)
                  }
                />
              ),
            },
            {
              key: "alamat",
              label: "Alamat",
              children: (
                <Alamat
                  value={formSections.alamat}
                  onChange={(values) => handleSectionChange("alamat", values)}
                  onSave={(values) => handleSectionSave("Alamat", values)}
                />
              ),
            },
            {
              key: "asalSekolah",
              label: "Asal Sekolah",
              children: (
                <AsalSekolah
                  value={formSections?.asalSekolah}
                  onChange={(values) =>
                    handleSectionChange("asalSekolah", values)
                  }
                  onSave={(values) => handleSectionSave("Asal Sekolah", values)}
                />
              ),
            },
            {
              key: "keluarga",
              label: "Keluarga",
              children: (
                <Keluarga
                  value={formSections?.keluarga}
                  onChange={(values) => handleSectionChange("keluarga", values)}
                  onSave={(values) => handleSectionSave("Keluarga", values)}
                />
              ),
            },
            {
              key: "berkas",
              label: "Berkas",
              children: <Berkas value={formData?.documents} />,
            },
          ]}
        />
      </Card>
    </UserLayout>
  );
};

export default Formulir;
