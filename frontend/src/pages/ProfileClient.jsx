import { Typography, Card, List, Tag, Flex, Avatar } from 'antd'
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons'
import useAuth from '../hooks/useAuth.js'

const { Title, Text } = Typography

const ProfileClient = () => {
  const { user } = useAuth()

  const history = user?.serviceHistory ?? [
    {
      id: 'sr-101',
      title: 'Instalación de llave mezcladora',
      technician: 'María López',
      status: 'Completado',
      scheduledAt: '2024-09-12',
    },
    {
      id: 'sr-102',
      title: 'Mantenimiento eléctrico preventivo',
      technician: 'Juan Pérez',
      status: 'En curso',
      scheduledAt: '2024-10-05',
    },
  ]

  return (
    <Flex vertical gap={24}>
      <Card>
        <Flex gap={24} align="center">
          <Avatar size={96} style={{ background: '#1677ff', fontSize: 32 }}>
            {user?.profile?.fullName?.slice(0, 1) ?? 'C'}
          </Avatar>
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>
              {user?.profile?.fullName ?? 'Cliente FixFinder'}
            </Title>
            <Flex gap={16} style={{ color: '#64748b' }}>
              <span><EnvironmentOutlined /> {user?.profile?.address ?? 'Ubicación no definida'}</span>
              <span><CalendarOutlined /> Miembro desde 2024</span>
            </Flex>
          </div>
        </Flex>
      </Card>
      <Card title="Historial de servicios">
        <List
          itemLayout="horizontal"
          dataSource={history}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={`Técnico: ${item.technician}`}
              />
              <Flex align="center" gap={16}>
                <Text type="secondary">Programado: {item.scheduledAt}</Text>
                <Tag color={item.status === 'Completado' ? 'green' : 'blue'}>{item.status}</Tag>
              </Flex>
            </List.Item>
          )}
        />
      </Card>
    </Flex>
  )
}

export default ProfileClient
