import { useEffect, useState } from 'react'
import {
  Typography,
  Card,
  List,
  Flex,
  Avatar,
  Rate,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  message,
} from 'antd'
import {
  CalendarOutlined,
  StarFilled,
  HeartFilled,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import api from '../utils/api.js'
import resolveAvatarUrl from '../utils/avatar.js'
import useAuth from '../hooks/useAuth.js'
import { useNavigate } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography

const ProfileClient = () => {
  const { user, setAuthState } = useAuth()
  const clientProfile = user?.clientProfile ?? {}
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState(clientProfile.addresses ?? [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    setAddresses(clientProfile.addresses ?? [])
  }, [clientProfile.addresses])

  const favorites = clientProfile.favorites ?? []
  const reputation = clientProfile.reputation ?? { average: 0, count: 0 }

  const persistAddresses = async (nextAddresses, successMessage) => {
    try {
      const { data } = await api.put(`/users/${user._id}`, {
        clientProfile: { addresses: nextAddresses },
      })
      setAddresses(nextAddresses)
      setAuthState((prev) => ({ ...prev, user: data.user }))
      message.success(successMessage)
    } catch (error) {
      console.error('client address update error', error)
      message.error('No se pudo actualizar la lista de direcciones')
    }
  }

  const handleAddAddress = async () => {
    try {
      const values = await form.validateFields()
      const nextAddresses = [...addresses, values]
      await persistAddresses(nextAddresses, 'Dirección guardada correctamente')
      form.resetFields()
      setIsModalOpen(false)
    } catch (error) {
      if (error?.errorFields) {
        message.warning('Completa los campos requeridos')
        return
      }
      console.error('add address error', error)
      message.error('No se pudo guardar la dirección')
    }
  }

  const handleRemoveAddress = async (index) => {
    try {
      const nextAddresses = addresses.filter((_, idx) => idx !== index)
      await persistAddresses(nextAddresses, 'Dirección eliminada')
    } catch (error) {
      console.error('remove address error', error)
      message.error('No se pudo eliminar la dirección')
    }
  }

  return (
    <Flex vertical gap={24}>
      <Card className="ff-surface">
        <Flex gap={24} align="center" wrap="wrap">
          <Avatar
            size={96}
            src={resolveAvatarUrl(user?.profile?.avatar)}
            style={{ background: '#1677ff', fontSize: 32 }}
          >
            {user?.profile?.fullName?.slice(0, 1) ?? 'C'}
          </Avatar>
          <div style={{ minWidth: 280 }}>
            <Title level={3} style={{ marginBottom: 8 }}>
              {user?.profile?.fullName ?? 'Cliente FixFinder'}
            </Title>
            <Flex gap={16} style={{ color: '#64748b', flexWrap: 'wrap' }}>
              <span>
                <CalendarOutlined /> Miembro desde {new Date(user?.createdAt ?? Date.now()).getFullYear()}
              </span>
              <span>
                <StarFilled style={{ color: '#d0a76b' }} /> Ranking como cliente:
              </span>
              <Rate disabled value={reputation.average} />
              <Text type="secondary">({reputation.count} calificaciones)</Text>
            </Flex>
          </div>
        </Flex>
      </Card>

      <Card
        title="Direcciones registradas"
        className="ff-surface"
        extra={(
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Agregar dirección
          </Button>
        )}
      >
        {addresses.length === 0 ? (
          <Empty description="Agrega tus direcciones para facilitar futuras visitas" />
        ) : (
          <List
            dataSource={addresses}
            renderItem={(address, index) => (
              <List.Item
                actions={[
                  <Button
                    key="delete"
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveAddress(index)}
                  >
                    Eliminar
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={address.label ?? 'Dirección'}
                  description={(
                    <Paragraph style={{ marginBottom: 0 }}>
                      {[address.street, address.city, address.state, address.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                      <br />
                      {address.country ?? 'México'}
                      {address.reference ? ` · Referencia: ${address.reference}` : ''}
                    </Paragraph>
                  )}
                />
              </List.Item>
            )}
          />
        )}
        <Paragraph type="secondary" style={{ marginTop: 16 }}>
          Estas direcciones solo son visibles para ti y para el técnico asignado mientras el servicio esté activo.
        </Paragraph>
      </Card>

      <Card title="Técnicos favoritos" className="ff-surface">
        {favorites.length === 0 ? (
          <Empty description="Aún no agregas técnicos a tu lista de favoritos" />
        ) : (
          <List
            dataSource={favorites}
            renderItem={(tech) => (
              <List.Item>
                <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                  <Flex gap={12} align="center">
                    <Avatar
                      src={resolveAvatarUrl(tech.profile?.avatar)}
                      icon={<HeartFilled style={{ color: '#d0a76b' }} />}
                    />
                    <div>
                      <Text strong>{tech.profile?.fullName}</Text>
                      <Paragraph style={{ margin: 0 }} type="secondary">
                        {(tech.technicianProfile?.specialties || []).join(', ') || 'Especialidades no registradas'}
                      </Paragraph>
                    </div>
                  </Flex>
                  <Rate disabled value={tech.technicianProfile?.rating?.average ?? 0} />
                </Flex>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="Nueva dirección"
        open={isModalOpen}
        onOk={handleAddAddress}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Etiqueta" name="label" tooltip="Ej. Casa, Oficina">
            <Input placeholder="Casa" />
          </Form.Item>
          <Form.Item
            label="Calle y número"
            name="street"
            rules={[{ required: true, message: 'Ingresa la calle y número' }]}
          >
            <Input placeholder="Calle Reforma 123, int. 4B" />
          </Form.Item>
          <Form.Item
            label="Ciudad"
            name="city"
            rules={[{ required: true, message: 'Ingresa la ciudad' }]}
          >
            <Input placeholder="Ciudad" />
          </Form.Item>
          <Form.Item label="Estado" name="state">
            <Input placeholder="Estado" />
          </Form.Item>
          <Form.Item label="Código postal" name="zipCode">
            <Input placeholder="Código postal" />
          </Form.Item>
          <Form.Item label="País" name="country" initialValue="México">
            <Input placeholder="País" />
          </Form.Item>
          <Form.Item label="Referencia" name="reference">
            <Input.TextArea rows={2} placeholder="Color de fachada, puntos de encuentro, etc." />
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  )
}

export default ProfileClient
