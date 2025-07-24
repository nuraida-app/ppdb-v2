import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Row,
  Col,
  Button,
  message,
  Spin,
} from "antd";
import Select from "react-select";
import { useAddAddressMutation } from "../../../controller/api/form/ApiForm";
import {
  useCitiesQuery,
  useDistrictsQuery,
  useProvincesQuery,
  useVillagesQuery,
} from "../../../controller/api/form/ApiArea";

const customStyles = {
  control: (base) => ({
    ...base,
    minHeight: "32px",
    height: "32px",
  }),
  valueContainer: (base) => ({
    ...base,
    height: "32px",
    padding: "0 8px",
  }),
  input: (base) => ({
    ...base,
    margin: "0px",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: "32px",
  }),
};

const Alamat = ({ value, onChange, onSave }) => {
  const [form] = Form.useForm();
  const [provinceId, setProvinceId] = useState("default");
  const [cityId, setCityId] = useState("default");
  const [districtId, setDistrictId] = useState("default");
  const [villageId, setVillageId] = useState("default");
  const [initialized, setInitialized] = useState(false);

  const { data: provinces, isLoading: isLoadingProvinces } =
    useProvincesQuery();
  const { data: cities, isLoading: isLoadingCities } = useCitiesQuery(
    provinceId,
    {
      skip: provinceId === "default",
    }
  );
  const { data: districts, isLoading: isLoadingDistricts } = useDistrictsQuery(
    cityId,
    {
      skip: cityId === "default",
    }
  );
  const { data: villages, isLoading: isLoadingVillages } = useVillagesQuery(
    districtId,
    {
      skip: districtId === "default",
    }
  );

  const [addAddress, { isLoading }] = useAddAddressMutation();

  useEffect(() => {
    if (value && provinces && !initialized) {
      const provId =
        provinces.find((p) => p.nama === value.provinsi)?.id || "default";
      setProvinceId(provId);
    }
  }, [value, provinces, initialized]);

  useEffect(() => {
    if (provinceId !== "default" && value && cities && !initialized) {
      const city = cities.find((c) => c.nama === value.kota);
      setCityId(city ? city.id : "default");
    }
  }, [provinceId, value, cities, initialized]);

  useEffect(() => {
    if (cityId !== "default" && value && districts && !initialized) {
      const district = districts.find((d) => d.nama === value.kecamatan);
      setDistrictId(district ? district.id : "default");
    }
  }, [cityId, value, districts, initialized]);

  useEffect(() => {
    if (districtId !== "default" && value && villages && !initialized) {
      const village = villages.find((v) => v.nama === value.desa);
      setVillageId(village ? village.id : "default");
      form.setFieldsValue({
        provinsi: provinceId,
        kota: cityId,
        kecamatan: districtId,
        desa: village ? village.id : "default",
        alamat: value.alamat || "",
        kode_pos: value.kode_pos || "",
        jarak: value.jarak || "",
        transportasi: value.transportasi,
      });
      setInitialized(true);
    }
  }, [districtId, value, villages, initialized, form, provinceId, cityId]);

  useEffect(() => {
    if (value && initialized) {
      form.setFieldsValue({
        alamat: value.alamat || "",
        kode_pos: value.kode_pos || "",
        jarak: value.jarak || "",
        transportasi: value.transportasi,
      });
    }
  }, [value, form, initialized]);

  const handleProvinceChange = (selectedOption) => {
    setProvinceId(selectedOption?.value || "default");
    setCityId("default");
    setDistrictId("default");
    setVillageId("default");
    setInitialized(true);
    form.setFieldsValue({
      kota: undefined,
      kecamatan: undefined,
      desa: undefined,
    });
  };

  const handleCityChange = (selectedOption) => {
    setCityId(selectedOption?.value || "default");
    setDistrictId("default");
    setVillageId("default");
    setInitialized(true);
    form.setFieldsValue({ kecamatan: undefined, desa: undefined });
  };

  const handleDistrictChange = (selectedOption) => {
    setDistrictId(selectedOption?.value || "default");
    setVillageId("default");
    setInitialized(true);
    form.setFieldsValue({ desa: undefined });
  };

  const handleVillageChange = (selectedOption) => {
    setVillageId(selectedOption?.value || "default");
    setInitialized(true);
  };

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        provinsi: provinces?.find((p) => p.id === provinceId)?.nama,
        kota: cities?.find((c) => c.id === cityId)?.nama,
        kecamatan: districts?.find((d) => d.id === districtId)?.nama,
        desa: villages?.find((v) => v.id === villageId)?.nama,
        alamat: values.alamat,
        kode_pos: values.kode_pos,
        jarak: values.jarak,
        transportasi: values.transportasi,
      };
      await addAddress(formattedValues).unwrap();
      message.success("Data alamat berhasil disimpan");
      onSave(formattedValues);
    } catch (error) {
      message.error("Gagal menyimpan data alamat");
    }
  };

  if (isLoadingProvinces) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const transportOptions = [
    { value: "Mobil Pribadi", label: "Mobil Pribadi" },
    { value: "Motor", label: "Motor" },
    { value: "Angkutan Umum", label: "Angkutan Umum" },
    { value: "Jemputan", label: "Jemputan" },
    { value: "Jalan Kaki", label: "Jalan Kaki" },
    { value: "Sepeda", label: "Sepeda" },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={(_, allValues) => onChange(allValues)}
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col xs={24} sm={24} md={24}>
          <Form.Item name="alamat" label="Alamat Lengkap">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="provinsi" label="Provinsi">
            <Select
              placeholder="Pilih Provinsi"
              value={provinces?.find((option) => option.id === provinceId)}
              onChange={handleProvinceChange}
              options={provinces?.map((province) => ({
                value: province.id,
                label: province.nama,
              }))}
              isLoading={isLoadingProvinces}
              isClearable
              styles={customStyles}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="kota" label="Kota/Kabupaten">
            <Select
              placeholder="Pilih Kota/Kabupaten"
              value={cities?.find((option) => option.id === cityId)}
              onChange={handleCityChange}
              options={cities?.map((city) => ({
                value: city.id,
                label: city.nama,
              }))}
              isLoading={isLoadingCities}
              isDisabled={provinceId === "default"}
              isClearable
              styles={customStyles}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="kecamatan" label="Kecamatan">
            <Select
              placeholder="Pilih Kecamatan"
              value={districts?.find((option) => option.id === districtId)}
              onChange={handleDistrictChange}
              options={districts?.map((district) => ({
                value: district.id,
                label: district.nama,
              }))}
              isLoading={isLoadingDistricts}
              isDisabled={cityId === "default"}
              isClearable
              styles={customStyles}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="desa" label="Desa/Kelurahan">
            <Select
              placeholder="Pilih Desa/Kelurahan"
              value={villages?.find((option) => option.id === villageId)}
              onChange={handleVillageChange}
              options={villages?.map((village) => ({
                value: village.id,
                label: village.nama,
              }))}
              isLoading={isLoadingVillages}
              isDisabled={districtId === "default"}
              isClearable
              styles={customStyles}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="kode_pos" label="Kode Pos">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="jarak" label="Jarak ke Sekolah (km)">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item name="transportasi" label="Transportasi ke Sekolah">
            <Select
              placeholder="Pilih Transportasi"
              options={transportOptions}
              styles={customStyles}
            />
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

export default Alamat;
