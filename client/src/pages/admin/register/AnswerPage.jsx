import React from "react";
import { useParams } from "react-router-dom";
import { useGetAnswerQuery } from "../../../controller/api/quiz/ApiQuiz";
import { Typography, List, Card, Button } from "antd";
import html2pdf from "html2pdf.js";
import { CloudDownloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const createMarkup = (html) => {
  return { __html: html };
};

const AnswerPage = () => {
  const { userId } = useParams();
  const id = userId;
  const { data: answers, isLoading, error } = useGetAnswerQuery(id);

  const exportToPDF = () => {
    const element = document.getElementById("answer-pdf-content");
    const opt = {
      margin: 0.5,
      filename: "Jawaban-Kuisioner.pdf",
      image: { type: "png", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return <div style={{ textAlign: "left" }}>Gagal memuat jawaban.</div>;

  return (
    <>
      <Button
        style={{ float: "right", marginBottom: 16 }}
        onClick={exportToPDF}
        type="primary"
        icon={<CloudDownloadOutlined />}
      >
        Export ke PDF
      </Button>
      <div
        id="answer-pdf-content"
        style={{ maxWidth: 700, margin: "0 auto", textAlign: "left" }}
      >
        <Title level={4} style={{ textAlign: "left" }}>
          Jawaban Kuisioner/Anket
        </Title>
        {!answers || answers.length === 0 ? (
          <Text>Tidak ada jawaban yang ditemukan.</Text>
        ) : (
          <List
            dataSource={answers}
            renderItem={(item) => (
              <Card
                style={{ marginBottom: 16 }}
                styles={{ body: { padding: 16 } }}
              >
                <div>
                  <Text strong>Pertanyaan:</Text>
                  <div style={{ marginBottom: 8 }}>
                    <div dangerouslySetInnerHTML={createMarkup(item.soal)} />
                  </div>
                  <Text strong>Jawaban:</Text>
                  <div>
                    <div dangerouslySetInnerHTML={createMarkup(item.jawaban)} />
                  </div>
                </div>
              </Card>
            )}
          />
        )}
      </div>
    </>
  );
};

export default AnswerPage;
