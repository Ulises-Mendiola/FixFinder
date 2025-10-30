import { Card, Typography, Flex, Avatar, Tag, Rate, List, Button } from 'antd'
import { CheckCircleOutlined, ScheduleOutlined, ToolOutlined } from '@ant-design/icons'
import useAuth from '../hooks/useAuth.js'

const { Title, Text, Paragraph } = Typography

const ProfileTech = () => {
  const { user } = useAuth()

  const availability = user?.availability ?? [
    { day: 'Lunes', hours: '9:00 - 18:00' },
    { day: 'Miércoles', hours: '9:00 - 18:00' },
    { day: 'Sábado', hours: '10:00 - 14:00' },
  ]

  const portfolio = user?.portfolio ?? [
    { id: 'p-1', title: 'Instalación de cocina integral', summary: 'Instalación completa de mobiliario y plomería.', year: 2024 },
    { id: 'p-2', title: 'Calentador solar', summary: 'Implementación de calentador solar residencial.', year: 2023 },
  ]

  return (
    <Flex vertical gap={24}>
      <Card>
        <Flex gap={24} align="center">
          <Avatar size={96} style={{ background: '#16a34a', fontSize: 32 }}>
            {user?.profile?.fullName?.slice(0, 1) ?? 'T'}
          </Avatar>
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>
              {user?.profile?.fullName ?? 'Técnico FixFinder'}
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 12 }}>
              {user?.bio ?? 'Comparte una descripción breve de tus servicios y experiencia.'}
            </Paragraph>
            <Flex gap={12} wrap="wrap">
              {(user?.skills ?? ['Instalaciones', 'Reparaciones']).map((skill) => (
                <Tag icon={<ToolOutlined />} key={skill}>{skill}</Tag>
              ))}
            </Flex>
          </div>
        </Flex>
      </Card>

      <Flex gap={24} wrap="wrap">
        <Card title="Calificación promedio" style={{ flex: 1, minWidth: 280 }}>
          <Flex vertical align="center" gap={12}>
            <Rate disabled allowHalf value={user?.rating?.average ?? 4.7} />
            <Text type="secondary">
              {user?.rating?.count ?? 84} reseñas verificadas
            </Text>
            <Button type="link">Ver reseñas</Button>
          </Flex>
        </Card>
        <Card title="Disponibilidad" style={{ flex: 1, minWidth: 280 }}>
          <List
            dataSource={availability}
            renderItem={({ day, hours }) => (
              <List.Item>
                <Flex justify="space-between" style={{ width: '100%' }}>
                  <Text strong>{day}</Text>
                  <Text type="secondary">{hours}</Text>
                </Flex>
              </List.Item>
            )}
          />
          <Button type="primary" block icon={<ScheduleOutlined />} style={{ marginTop: 16 }}>
            Actualizar agenda
          </Button>
        </Card>
      </Flex>

      <Card title="Portafolio de trabajos">
        <List
          itemLayout="horizontal"
          dataSource={portfolio}
          renderItem={({ id, title, summary, year }) => (
            <List.Item key={id}>
              <List.Item.Meta
                avatar={<CheckCircleOutlined style={{ fontSize: 24, color: '#16a34a' }} />}
                title={title}
                description={summary}
              />
              <Text type="secondary">{year}</Text>
            </List.Item>
          )}
        />
      </Card>
    </Flex>
  )
}

export default ProfileTech
