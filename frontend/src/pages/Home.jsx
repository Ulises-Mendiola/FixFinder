import { useMemo } from 'react'
import { Typography, Row, Col, Card, Steps, Flex, Button } from 'antd'
import { SearchOutlined, CheckCircleOutlined, PhoneOutlined } from '@ant-design/icons'
import TechnicianCard from '../components/TechnicianCard.jsx'

const { Title, Paragraph, Text } = Typography

const mockTechnicians = [
  {
    id: '1',
    profile: { fullName: 'María López' },
    specialty: 'Plomería',
    location: 'CDMX',
    rating: { average: 4.8, count: 92 },
    bio: 'Especialista en instalaciones hidráulicas y mantenimiento de calentadores.',
    experienceYears: 8,
    skills: ['Instalaciones', 'Reparaciones', 'Calentadores'],
    avatar: null,
  },
  {
    id: '2',
    profile: { fullName: 'Juan Pérez' },
    specialty: 'Electricidad',
    location: 'Guadalajara',
    rating: { average: 4.6, count: 120 },
    bio: 'Electricista certificado con experiencia en residencias y comercios.',
    experienceYears: 10,
    skills: ['Cableado', 'Paneles', 'Domótica'],
    avatar: null,
  },
]

const Home = () => {
  const technicians = useMemo(() => mockTechnicians, [])

  return (
    <Flex vertical gap={32}>
      <Card
        style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          color: '#fff',
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={14}>
            <Title level={2} style={{ color: '#fff' }}>
              Encuentra al profesional ideal para tu proyecto
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
              FixFinder conecta clientes con técnicos verificados en minutos. Gestiona solicitudes, da seguimiento en tiempo real y asegura resultados de calidad.
            </Paragraph>
            <Flex gap={16}>
              <Button type="primary" size="large" icon={<SearchOutlined />}>
                Buscar técnicos
              </Button>
              <Button size="large" ghost>
                ¿Eres técnico? Únete ahora
              </Button>
            </Flex>
          </Col>
          <Col xs={24} md={10}>
            <Steps
              items={[
                { title: 'Describe tu necesidad', icon: <PhoneOutlined /> },
                { title: 'Recibe propuestas', icon: <SearchOutlined /> },
                { title: 'Contrata con confianza', icon: <CheckCircleOutlined /> },
              ]}
              direction="vertical"
              current={2}
              status="finish"
              style={{ color: '#fff' }}
            />
          </Col>
        </Row>
      </Card>
      <div>
        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>Técnicos destacados</Title>
            <Text type="secondary">Perfiles verificados con calificaciones sobresalientes.</Text>
          </div>
          <Button type="link">Ver todos</Button>
        </Flex>
        <Row gutter={[24, 24]}>
          {technicians.map((technician) => (
            <Col xs={24} md={12} key={technician.id}>
              <TechnicianCard technician={technician} />
            </Col>
          ))}
        </Row>
      </div>
    </Flex>
  )
}

export default Home
