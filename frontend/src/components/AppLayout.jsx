import PropTypes from 'prop-types'
import { Layout, Menu, Flex, Typography, Button } from 'antd'
import {
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
  SolutionOutlined,
  ControlOutlined,
} from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const { Header, Content, Footer } = Layout
const { Title } = Typography

const navItems = [
  { key: '/', label: <Link to="/">Inicio</Link>, icon: <HomeOutlined /> },
  { key: '/technicians', label: <Link to="/technicians">Técnicos</Link>, icon: <SolutionOutlined /> },
  { key: '/become-technician', label: <Link to="/become-technician">Ser técnico</Link>, icon: <UserOutlined /> },
]

const adminItem = {
  key: '/admin',
  label: <Link to="/admin">Panel</Link>,
  icon: <ControlOutlined />,
}

const AppLayout = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const items = [...navItems]

  if (user?.role === 'superadmin') {
    items.push(adminItem)
  }

  if (isAuthenticated) {
    items.push({
      key: user?.role === 'technician' ? '/profile/tech' : '/profile/client',
      label: <Link to={user?.role === 'technician' ? '/profile/tech' : '/profile/client'}>Mi perfil</Link>,
      icon: <UserOutlined />,
    })
  }

  const activeKey = items.find((item) => location.pathname.startsWith(item.key))?.key ?? '/'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <Flex align="center" justify="space-between">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src="/logo.svg" alt="FixFinder" width={36} height={36} />
            <Title level={4} style={{ margin: 0 }}>FixFinder</Title>
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[activeKey]}
            items={items}
            style={{ flex: 1, marginLeft: 32 }}
          />
          <Flex align="center" gap={16}>
            {isAuthenticated ? (
              <>
                <span style={{ fontWeight: 500 }}>Hola, {user?.profile?.fullName ?? 'Usuario'}</span>
                <Button icon={<LogoutOutlined />} onClick={logout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button type="link" icon={<LoginOutlined />}>
                  <Link to="/login">Ingresar</Link>
                </Button>
                <Button type="primary">
                  <Link to="/register">Crear cuenta</Link>
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Header>
      <Content style={{ padding: '32px 48px', background: '#f5f7fb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        FixFinder © {new Date().getFullYear()} — Conectamos talento con necesidades reales.
      </Footer>
    </Layout>
  )
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppLayout
