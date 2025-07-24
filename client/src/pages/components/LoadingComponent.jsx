import { Spin } from "antd";
import React from "react";

const LoadingComponent = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.8)",
        zIndex: 1000,
      }}
    >
      <Spin size="large">
        <div
          style={{
            padding: "30px",
            background: "rgba(0, 0, 0, 0.05)",
            borderRadius: "4px",
            backdropFilter: "blur(4px)",
          }}
        >
          Memuat Aplikasi...
        </div>
      </Spin>
    </div>
  );
};

export default LoadingComponent;
