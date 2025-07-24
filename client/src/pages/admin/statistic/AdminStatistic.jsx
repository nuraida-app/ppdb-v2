import React from "react";
import AdminLayout from "../Layout/AdminLayout";
import { Card, Row, Col, Spin } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
  useGetDemographicQuery,
  useGetMediaQuery,
} from "../../../controller/api/admin/ApiStatistic";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminStatistic = () => {
  const {
    data: demographicData,
    isLoading: isLoadingDemographic,
    error,
  } = useGetDemographicQuery();
  const { data: mediaData, isLoading: isLoadingMedia } = useGetMediaQuery();

  if (isLoadingDemographic || isLoadingMedia) {
    return (
      <AdminLayout title="Statistik">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  // Prepare demographic data for charts
  const provinsiData = {
    labels: demographicData?.provinsi?.map((item) => item.provinsi) || [],
    datasets: [
      {
        label: "Jumlah Pendaftar",
        data: demographicData?.provinsi?.map((item) => item.total) || [],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const kotaData = {
    labels: demographicData?.regional?.map((item) => item.kota) || [],
    datasets: [
      {
        label: "Jumlah Pendaftar",
        data: demographicData?.regional?.map((item) => item.total) || [],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare social media data for pie chart
  const mediaChartData = {
    labels: mediaData?.map((item) => item.media) || [],
    datasets: [
      {
        data: mediaData?.map((item) => item.count) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Statistik Pendaftar",
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Distribusi Media Pembayaran",
      },
    },
  };

  return (
    <AdminLayout title="Statistik">
      <Row gutter={[16, 16]}>
        {/* Provinsi Chart */}
        <Col xs={24} lg={12}>
          <Card title="Statistik Pendaftar per Provinsi">
            <Bar data={provinsiData} options={chartOptions} />
          </Card>
        </Col>

        {/* Kota Chart */}
        <Col xs={24} lg={12}>
          <Card title="Statistik Pendaftar per Kota">
            <Bar data={kotaData} options={chartOptions} />
          </Card>
        </Col>

        {/* Social Media Chart */}
        <Col xs={24} lg={12}>
          <Card title="Distribusi Media Pembayaran">
            <Pie data={mediaChartData} options={pieChartOptions} />
          </Card>
        </Col>

        {/* Kecamatan Chart */}
        <Col xs={24} lg={12}>
          <Card title="Statistik Pendaftar per Kecamatan">
            <Bar
              data={{
                labels:
                  demographicData?.kecamatan?.map((item) => item.kecamatan) ||
                  [],
                datasets: [
                  {
                    label: "Jumlah Pendaftar",
                    data:
                      demographicData?.kecamatan?.map((item) => item.total) ||
                      [],
                    backgroundColor: "rgba(153, 102, 255, 0.5)",
                    borderColor: "rgba(153, 102, 255, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
};

export default AdminStatistic;
