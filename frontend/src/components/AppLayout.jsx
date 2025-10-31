import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Layout,
  Menu,
  Button,
  Flex,
} from 'antd'
import {
  HomeOutlined,
  TeamOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  ControlOutlined,
  FormOutlined,
  MessageOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import appLogo from '../assets/FixFinder_SF-2.png'

const { Sider, Header, Content, Footer } = Layout

const iconStyle = { color: 'var(--ff-accent)' }

const AppLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = useMemo(() => {
    if (!isAuthenticated) return []

    const items = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: <Link to="/">Inicio</Link>,
      },
      {
        key: '/technicians',
        icon: <TeamOutlined />,
        label: <Link to="/technicians">Técnicos</Link>,
      },
      {
        key: '/chats',
        icon: <MessageOutlined />,
        label: <Link to="/chats">Chats</Link>,
      },
    ]

    if (user?.role === 'technician') {
      items.splice(3, 0, {
        key: '/quotes',
        icon: <DollarCircleOutlined />,
        label: <Link to="/quotes">Cotizaciones</Link>,
      })
    }

    if (user?.role === 'client') {
      items.push({
        key: '/requests/new',
        icon: <FormOutlined />,
        label: <Link to="/requests/new">Nueva solicitud</Link>,
      })
    }

    if (user?.role === 'superadmin') {
      items.push({
        key: '/admin',
        icon: <ControlOutlined />,
        label: <Link to="/admin">Panel admin</Link>,
      })
    }

    const profileKey = user?.role === 'technician' ? '/profile/tech' : '/profile/client'
    items.push({
      key: profileKey,
      icon: <UserOutlined />,
      label: <Link to={profileKey}>Mi perfil</Link>,
    })

    items.push({
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar sesión',
    })

    return items
  }, [isAuthenticated, user])

  const activeKey = useMemo(() => {
    if (!isAuthenticated) return '/'
    const candidates = menuItems.filter((item) => item.key !== 'logout').map((item) => item.key)
    const current = candidates.find((key) => location.pathname.startsWith(key))
    return current ?? '/'
  }, [isAuthenticated, menuItems, location.pathname])

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout()
      navigate('/login')
    }
  }


  if (!isAuthenticated) {
    return (
      <Layout className="ff-public-layout">
        <Header className="ff-public-header">
          <Flex align="center" justify="space-between">
            <Link to="/" className="ff-brand">
              <img
                src={appLogo}
                alt="FixFinder"
                width={150}
                height={150}
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <Flex gap={12}>
              <Button type="link" icon={<LoginOutlined style={iconStyle} />}>
                <Link to="/login">Ingresar</Link>
              </Button>
              <Button type="primary">
                <Link to="/register">Crear cuenta</Link>
              </Button>
            </Flex>
          </Flex>
        </Header>
        <Content className="ff-public-content">
          <div className="ff-shell">
            {children}
          </div>
        </Content>
        <Footer className="ff-footer">
          FixFinder © {new Date().getFullYear()} — Conectamos talento con necesidades reales.
        </Footer>
      </Layout>
    )
  }

  return (
    <Layout className="ff-app-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={220}
        className="ff-sider"
      >
        <div className="ff-sider-brand">
          <img
            src={appLogo}
            alt="FixFinder"
            width={150}
            height={150}
            style={{ objectFit: 'contain' }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout className="ff-main">
        <Header className="ff-topbar">
          <Flex align="center" justify="space-between">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
              className="ff-topbar-trigger"
            />
            <Flex gap={12} align="center" style={{ color: '#1e293b', fontWeight: 500 }}>
              <span>Hola, {user?.profile?.fullName ?? 'Usuario'}</span>
            </Flex>
          </Flex>
        </Header>
        <Content className="ff-main-content">
          <div key={`${location.pathname}${location.hash}${location.search}`} className="ff-shell">
            {children}
          </div>
        </Content>
        <Footer className="ff-footer">
          FixFinder © {new Date().getFullYear()} — Conectamos talento con necesidades reales.
        </Footer>
      </Layout>
    </Layout>
  )
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppLayout
