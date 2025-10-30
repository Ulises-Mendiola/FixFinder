import { useEffect, useState } from 'react'
import { Card, Typography, Tabs, Table, Tag, Flex, Statistic, Row, Col } from 'antd'
import { UsergroupAddOutlined, ToolOutlined, DashboardOutlined } from '@ant-design/icons'
import api from '../utils/api.js'

const { Title } = Typography

const columnsUsers = [
  { title: 'Nombre', dataIndex: ['profile', 'fullName'], key: 'fullName' },
  { title: 'Correo', dataIndex: 'email', key: 'email' },
  {
    title: 'Rol',
    dataIndex: 'role',
    key: 'role',
    render: (role) => <Tag color={role === 'superadmin' ? 'purple' : role === 'technician' ? 'blue' : 'green'}>{role}</Tag>,
  },
]

const columnsRequests = [
  { title: 'Título', dataIndex: 'title', key: 'title' },
  { title: 'Cliente', dataIndex: ['client', 'profile', 'fullName'], key: 'client' },
  {
    title: 'Estado',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const colorMap = {
        pending: 'orange',
        accepted: 'blue',
        completed: 'green',
        cancelled: 'red',
      }
      return <Tag color={colorMap[status] ?? 'default'}>{status}</Tag>
    },
  },
]

const SuperAdminPanel = () => {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState({
    metrics: { totalUsers: 0, totalTechnicians: 0, openRequests: 0 },
    users: [],
    requests: [],
  })

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get('/admin/dashboard')
        setDashboard(data)
      } catch (error) {
        console.error('dashboard error', error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  return (
    <Card loading={loading}>
      <Flex vertical gap={24}>
        <Title level={3}>Panel de control FixFinder</Title>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Usuarios totales" value={dashboard.metrics.totalUsers} prefix={<UsergroupAddOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Técnicos activos" value={dashboard.metrics.totalTechnicians} prefix={<ToolOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="Solicitudes abiertas" value={dashboard.metrics.openRequests} prefix={<DashboardOutlined />} />
            </Card>
          </Col>
        </Row>
        <Tabs
          defaultActiveKey="users"
          items={[
            {
              key: 'users',
              label: 'Usuarios',
              children: <Table columns={columnsUsers} dataSource={dashboard.users} rowKey="_id" pagination={false} />,
            },
            {
              key: 'requests',
              label: 'Solicitudes',
              children: <Table columns={columnsRequests} dataSource={dashboard.requests} rowKey="_id" pagination={false} />,
            },
          ]}
        />
      </Flex>
    </Card>
  )
}

export default SuperAdminPanel
