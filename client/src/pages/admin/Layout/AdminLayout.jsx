import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  theme,
  Flex,
  Dropdown,
  Image,
  message,
  Typography,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  CreditCardOutlined,
  BankOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  FormOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FieldTimeOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useGetSettingQuery } from "../../../controller/api/admin/ApiSetting";
import { useLogoutMutation } from "../../../controller/api/auth/ApiUser";
import { useSelector } from "react-redux";
const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { user } = useSelector((state) => state.auth);

  // Get current path without leading slash
  const currentPath = location.pathname.replace("/admin-", "");

  const { data: setting, isLoading } = useGetSettingQuery();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      message.success("Berhasil logout");
      navigate("/");
    } catch (error) {
      message.error(error.data?.message || "Gagal logout");
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (user?.peran !== "admin") {
        navigate("/");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [user]);

  const profileItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/admin-profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Pengaturan",
      onClick: () => navigate("/admin-setting"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: "Beranda",
      onClick: () => navigate("/admin-dashboard"),
    },
    {
      key: "pendaftar",
      icon: <UserOutlined />,
      label: "Pendaftar",
      onClick: () => navigate("/admin-pendaftar"),
    },
    {
      key: "pembayaran",
      icon: <CreditCardOutlined />,
      label: "Pembayaran",
      onClick: () => navigate("/admin-pembayaran"),
    },
    {
      key: "periode",
      icon: <FieldTimeOutlined />,
      label: "Periode",
      onClick: () => navigate("/admin-periode"),
    },
    {
      key: "sekolah",
      icon: <BankOutlined />,
      label: "Sekolah",
      onClick: () => navigate("/admin-sekolah"),
    },
    {
      key: "jenjang",
      icon: <TeamOutlined />,
      label: "Jenjang",
      onClick: () => navigate("/admin-jenjang"),
    },
    {
      key: "info",
      icon: <UserOutlined />,
      label: "Info",
      onClick: () => navigate("/admin-info"),
    },
    {
      key: "jadwal",
      icon: <CalendarOutlined />,
      label: "Jadwal",
      onClick: () => navigate("/admin-jadwal"),
    },
    {
      key: "kuisioner",
      icon: <FormOutlined />,
      label: "Kuisioner",
      onClick: () => navigate("/admin-kuisioner"),
    },
    {
      key: "user",
      icon: <UserOutlined />,
      label: "User",
      onClick: () => navigate("/admin-user"),
    },
    {
      key: "statistik",
      icon: <BarChartOutlined />,
      label: "Statistik",
      onClick: () => navigate("/admin-statistik"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <title>{title}</title>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: "64px",
            margin: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "5px",
            overflow: "hidden",
          }}
        >
          <Flex align="center" justify="center" gap="small">
            {setting?.logo && (
              <Image
                src={setting.logo}
                alt="Logo"
                preview={false}
                style={{
                  width: collapsed ? "32px" : "40px",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            )}
            {!collapsed && setting?.nama && (
              <Text
                style={{
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {setting.nama}
              </Text>
            )}
          </Flex>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath || "dashboard"]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Flex direction="horizontal" align="center" gap={8}>
            <Button
              type="primary"
              color="primary"
              variant="solid"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                marginLeft: "16px",
              }}
            />
            <Text style={{ fontSize: "16px", fontWeight: "bold" }}>
              {title}
            </Text>
          </Flex>

          <Dropdown
            menu={{ items: profileItems }}
            placement="bottomRight"
            arrow
          >
            <Button
              type="primary"
              color="primary"
              variant="outlined"
              icon={<UserOutlined />}
              style={{ marginRight: "16px" }}
            >
              Profile
            </Button>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
