import React from "react";
import {
  Card,
  Descriptions,
  Image,
  Typography,
  Divider,
  Flex,
  Button,
} from "antd";
import html2pdf from "html2pdf.js";

const { Title } = Typography;

const Invoice = ({ data }) => {
  const exportToPDF = () => {
    const element = document.querySelector(".print-content");
    const opt = {
      margin: 0.5,
      filename: `Invoice-Pembayaran-${data.nama}.pdf`,
      image: { type: "png", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <Card>
      <Flex justify="space-between" align="center">
        <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
          Invoice Pembayaran
        </Title>
        <Button type="primary" onClick={exportToPDF}>
          Download PDF
        </Button>
      </Flex>

      <div className="print-content">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Nama">{data.nama}</Descriptions.Item>
          <Descriptions.Item label="Email">{data.email}</Descriptions.Item>
          <Descriptions.Item label="Nomor Telepon">
            {data.tlp}
          </Descriptions.Item>
          <Descriptions.Item label="Nominal">
            Rp {parseInt(data.nominal).toLocaleString("id-ID")}
          </Descriptions.Item>
          <Descriptions.Item label="Tanggal Pembayaran">
            {new Date(data.tgl_bayar).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Descriptions.Item>
        </Descriptions>

        <Divider>Bukti Pembayaran</Divider>

        <div style={{ textAlign: "center" }}>
          <Image
            src={data.berkas}
            alt="Bukti Pembayaran"
            style={{ maxWidth: "100%", maxHeight: "400px" }}
          />
        </div>
      </div>
    </Card>
  );
};

export default Invoice;
