import React from "react";
import { Card, Spin } from "antd";
import UserLayout from "../Layout/UserLayout";
import { useSelector } from "react-redux";
import { useMyPaymentQuery } from "../../../controller/api/payment/ApiPayment";
import Invoice from "./Invoice";
import PaymentForm from "./PaymentForm";

const Pembayaran = () => {
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading } = useMyPaymentQuery(user?.id, {
    skip: !user?.id,
  });

  console.log(data);

  if (isLoading) {
    return (
      <UserLayout title="Pembayaran">
        <Card>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p style={{ marginTop: "20px" }}>Loading payment data...</p>
          </div>
        </Card>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Pembayaran">
      {!data && <PaymentForm user={user} />}
      {data && !data?.ket && (
        <Card>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 18, color: "#faad14" }}>
              Menunggu konfirmasi pembayaran...
            </p>
          </div>
        </Card>
      )}
      {data?.ket && <Invoice data={data} />}
    </UserLayout>
  );
};

export default Pembayaran;
