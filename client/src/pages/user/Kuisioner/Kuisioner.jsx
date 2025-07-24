import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Radio,
  Button,
  message,
  Space,
  Typography,
  Divider,
  Alert,
  Input,
} from "antd";
import {
  useGetQuizzesQuery,
  useCreateAnswerMutation,
  useGetAnswerQuery,
} from "../../../controller/api/quiz/ApiQuiz";
import UserLayout from "../Layout/UserLayout";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { TextArea } = Input;

const createMarkup = (html) => {
  return { __html: html };
};

const Kuisioner = () => {
  const user = useSelector((state) => state.auth.user);

  const [answerType1, setAnswerType1] = useState({});

  const { data, isLoading, error } = useGetQuizzesQuery({
    page: "",
    limit: "",
    search: "",
  });
  const { data: answers } = useGetAnswerQuery(user?.id, { skip: !user?.id });

  const [createAnswer] = useCreateAnswerMutation();

  const type1 = data?.filter(
    (item) => item.jenis === "Kuisioner" && item.pengisi === "Ortu"
  );
  const type2 = data?.filter(
    (item) => item.jenis === "Angket" && item.pengisi === "Ortu"
  );
  const type3 = data?.filter(
    (item) => item.jenis === "Angket" && item.pengisi === "Calon Peserta Didik"
  );

  // Prefill jawaban jika sudah ada
  useEffect(() => {
    if (answers) {
      const prefilledAnswers = {};
      answers.forEach((answer) => {
        prefilledAnswers[answer.soal_id] = answer.jawaban;
      });
      setAnswerType1(prefilledAnswers);
    }
  }, [answers]);

  const handleAnswerChange = (quizId, value) => {
    setAnswerType1((prev) => ({
      ...prev,
      [quizId]: value,
    }));
  };

  const addAnswerForType1 = (id) => {
    const answerForQuestion = answerType1[id];

    if (!answerForQuestion || answerForQuestion.trim() === "") {
      message.error("Jawaban tidak boleh kosong.");
      return;
    }

    const dataToSend = {
      userId: user?.id,
      answer: answerForQuestion,
      quizId: id,
    };

    createAnswer(dataToSend)
      .unwrap()
      .then(() => {
        message.success("Jawaban berhasil disimpan");
      })
      .catch((error) => {
        message.error("Gagal menyimpan jawaban");
      });
  };

  const addType2_3 = (id, value) => {
    const dataToSend = {
      userId: user?.id,
      answer: value,
      quizId: id,
    };

    createAnswer(dataToSend)
      .unwrap()
      .then(() => {
        message.success("Jawaban berhasil disimpan");
      })
      .catch((error) => {
        message.error("Gagal menyimpan jawaban");
      });
  };

  if (isLoading) {
    return (
      <UserLayout title="Kuisioner">
        <Card>
          <div className="text-center">Loading...</div>
        </Card>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout title="Kuisioner">
        <Alert
          message="Error"
          description="Terjadi kesalahan saat memuat data kuisioner"
          type="error"
          showIcon
        />
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Kuisioner">
      <div className="max-w-4xl mx-auto">
        {type1 && type1.length > 0 && (
          <Card
            className="mb-6"
            style={{ borderRadius: 12, boxShadow: "0 2px 8px #f0f1f2" }}
          >
            <Title level={4}>Kuisioner untuk Orang Tua</Title>
            <Text type="secondary" className="block mb-4">
              Silakan isi kuisioner berikut dengan jujur dan teliti
            </Text>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {type1.map((quiz, idx) => (
                <Card
                  key={quiz.id}
                  style={{
                    background: "#fafcff",
                    borderRadius: 10,
                    border: "1px solid #e6f4ff",
                    boxShadow: "0 1px 4px #e6f4ff",
                    marginBottom: 0,
                  }}
                >
                  <div className="font-bold mb-2" style={{ fontSize: 16 }}>
                    {idx + 1}.{" "}
                    <span dangerouslySetInnerHTML={createMarkup(quiz.soal)} />
                  </div>
                  <TextArea
                    rows={4}
                    placeholder="Ketik jawaban Anda di sini..."
                    value={answerType1[quiz.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(quiz.id, e.target.value)
                    }
                    style={{ marginBottom: 12, borderRadius: 8 }}
                  />
                  <div style={{ textAlign: "right" }}>
                    <Button
                      type="primary"
                      onClick={() => addAnswerForType1(quiz.id)}
                      style={{ borderRadius: 6, padding: "0 24px" }}
                    >
                      Simpan Jawaban
                    </Button>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        )}

        {type2 && type2.length > 0 && (
          <Card className="mb-6">
            <Title level={4}>Angket untuk Orang Tua</Title>
            <Text type="secondary" className="block mb-4">
              Mohon isi angket berikut sesuai dengan kondisi yang sebenarnya
            </Text>
            {type2.map((quiz) => (
              <div key={quiz.id} className="mb-6">
                <div
                  className="font-bold mb-2"
                  dangerouslySetInnerHTML={createMarkup(quiz.soal)}
                />
                <Radio.Group
                  onChange={(e) => addType2_3(quiz.id, e.target.value)}
                  value={
                    answers?.find((a) => a.soal_id === quiz.id)?.jawaban ||
                    undefined
                  }
                >
                  <Space direction="vertical">
                    <Radio value="Ya">Ya</Radio>
                    <Radio value="Tidak">Tidak</Radio>
                  </Space>
                </Radio.Group>
              </div>
            ))}
          </Card>
        )}

        {type3 && type3.length > 0 && (
          <Card>
            <Title level={4}>Angket untuk Calon Peserta Didik</Title>
            <Text type="secondary" className="block mb-4">
              Silakan isi angket berikut sesuai dengan kemampuan dan minat Anda
            </Text>
            {type3.map((quiz) => (
              <div key={quiz.id} className="mb-6">
                <div
                  className="font-bold mb-2"
                  dangerouslySetInnerHTML={createMarkup(quiz.soal)}
                />
                <Radio.Group
                  onChange={(e) => addType2_3(quiz.id, e.target.value)}
                  value={
                    answers?.find((a) => a.soal_id === quiz.id)?.jawaban ||
                    undefined
                  }
                >
                  <Space direction="vertical">
                    <Radio value="Ya">Ya</Radio>
                    <Radio value="Tidak">Tidak</Radio>
                  </Space>
                </Radio.Group>
              </div>
            ))}
          </Card>
        )}

        {(!type1 || type1.length === 0) &&
          (!type2 || type2.length === 0) &&
          (!type3 || type3.length === 0) && (
            <Alert
              message="Tidak Ada Kuisioner"
              description="Belum ada kuisioner yang tersedia untuk Anda"
              type="info"
              showIcon
            />
          )}
      </div>
    </UserLayout>
  );
};

export default Kuisioner;
