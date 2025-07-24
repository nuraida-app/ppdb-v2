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
  DashboardOutlined,
  FormOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useLogoutMutation } from "../../../controller/api/auth/ApiUser";
import { useGetSettingQuery } from "../../../controller/api/admin/ApiSetting";
import { useSelector } from "react-redux";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const UserLayout = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { user } = useSelector((state) => state.auth);

  const { data: setting, isLoading } = useGetSettingQuery();

  // Get current path without leading slash
  const currentPath = location.pathname.replace("/user-", "");

  const [logout] = useLogoutMutation();

  // Add screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
      if (user?.peran !== "user") {
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
      onClick: () => navigate("/user-profile"),
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
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/user-dashboard"),
    },
    {
      key: "pembayaran",
      icon: <DollarOutlined />,
      label: "Pembayaran",
      onClick: () => navigate("/user-pembayaran"),
    },
    {
      key: "formulir",
      icon: <FormOutlined />,
      label: "Formulir",
      onClick: () => navigate("/user-formulir"),
    },

    {
      key: "kuisioner",
      icon: <FileTextOutlined />,
      label: "Kuisioner",
      onClick: () => navigate("/user-kuisioner"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <title>{title}</title>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          display: isMobile && collapsed ? "none" : "block",
        }}
        breakpoint="md"
        collapsedWidth={isMobile ? 0 : 80}
      >
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
            <Text
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
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

export default UserLayout;
