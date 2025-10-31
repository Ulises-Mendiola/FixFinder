import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  Tabs,
  List,
  Typography,
  Tag,
  Space,
  Spin,
  Empty,
  Button,
  Flex,
} from 'antd'
import {
  ReloadOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../utils/api.js'
import useAuth from '../hooks/useAuth.js'

const { Title, Text, Paragraph } = Typography

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '$0.00'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

const formatDate = (value) => {
  if (!value) return 'Sin fecha'
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : 'Sin fecha'
}

const Quotes = () => {
  const { user } = useAuth()
  const [quotes, setQuotes] = useState({ pending: [], accepted: [], rejected: [] })
  const [loading, setLoading] = useState(false)

  const isTechnician = user?.role === 'technician'

  const fetchQuotes = async () => {
    if (!isTechnician) return
    try {
      setLoading(true)
      const { data } = await api.get('/offers/mine')
      setQuotes({
        pending: data.offers?.pending ?? [],
        accepted: data.offers?.accepted ?? [],
        rejected: data.offers?.rejected ?? [],
      })
    } catch (error) {
      console.error('fetch quotes error', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [isTechnician])

  const renderList = (items, status) => {
    if (loading) {
      return (
        <FlexCentered>
          <Spin />
        </FlexCentered>
      )
    }

    if (!items.length) {
      return <Empty description="Sin cotizaciones en este estado" />
    }

    return (
      <List
        dataSource={items}
        renderItem={(item) => {
          const request = item.serviceRequest ?? {}
          return (
            <List.Item key={item.id}>
              <Card className="ff-surface" style={{ width: '100%' }}>
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  <FlexHeader>
                    <div>
                      <Text strong>{request.title ?? 'Solicitud sin título'}</Text>
                      <div>
                        <Tag color="processing">{request.category ?? 'General'}</Tag>
                        <Tag icon={<DollarCircleOutlined />} color="blue">
                          {formatCurrency(item.amount)}
                        </Tag>
                      </div>
                    </div>
                    <Text type="secondary">
                      Enviada: {formatDate(item.createdAt)}
                    </Text>
                  </FlexHeader>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {request.scheduledAt ? `Servicio programado: ${formatDate(request.scheduledAt)}` : 'Fecha pendiente por definir'}
                    </Text>
                    <Text type="secondary">
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {request.address ?? 'Dirección no especificada'}
                    </Text>
                  </Space>
                  {item.message && (
                    <Paragraph style={{ marginBottom: 0 }}>
                      <Text strong>Mensaje:</Text> {item.message}
                    </Paragraph>
                  )}
                  {status === 'accepted' && (
                    <Tag color="success">El cliente aceptó tu oferta</Tag>
                  )}
                  {status === 'rejected' && (
                    <Tag color="error">El cliente eligió otra propuesta</Tag>
                  )}
                  {status === 'pending' && (
                    <Text type="secondary">
                      El cliente aún no responde. Te notificaremos cuando haya una decisión.
                    </Text>
                  )}
                </Space>
              </Card>
            </List.Item>
          )
        }}
      />
    )
  }

  const tabItems = useMemo(() => ([
    {
      key: 'pending',
      label: `Pendientes (${quotes.pending.length})`,
      children: renderList(quotes.pending, 'pending'),
    },
    {
      key: 'accepted',
      label: `Aceptadas (${quotes.accepted.length})`,
      children: renderList(quotes.accepted, 'accepted'),
    },
    {
      key: 'rejected',
      label: `Rechazadas (${quotes.rejected.length})`,
      children: renderList(quotes.rejected, 'rejected'),
    },
  ]), [quotes, loading])

  if (!isTechnician) {
    return (
      <Card>
        <Title level={4}>Módulo de cotizaciones</Title>
        <Paragraph>
          Este módulo está disponible únicamente para técnicos registrados.
        </Paragraph>
      </Card>
    )
  }

  return (
    <Card className="ff-surface">
      <FlexHeader>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>Mis cotizaciones</Title>
          <Text type="secondary">
            Revisa el estado de tus propuestas y da seguimiento oportuno.
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchQuotes} loading={loading}>
          Actualizar
        </Button>
      </FlexHeader>
      <Tabs items={tabItems} />
    </Card>
  )
}

const FlexHeader = ({ children }) => (
  <Flex align="center" justify="space-between" style={{ width: '100%' }}>
    {children}
  </Flex>
)

const FlexCentered = ({ children }) => (
  <Flex align="center" justify="center" style={{ minHeight: 160 }}>
    {children}
  </Flex>
)

export default Quotes
