import { useEffect, useMemo, useState } from 'react'
import {
  Tabs,
  Input,
  Select,
  Row,
  Col,
  Flex,
  Empty,
  Card,
  Typography,
  Form,
  Button,
  Upload,
  Rate,
  Space,
  Divider,
  message,
  Modal,
} from 'antd'
import { InboxOutlined, ToolOutlined, TeamOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import TechnicianCard from '../components/TechnicianCard.jsx'
import useAuth from '../hooks/useAuth.js'
import resolveAvatarUrl from '../utils/avatar.js'

const { Title, Paragraph, Text } = Typography

const specialtyOptions = [
  'Plomer\u00eda',
  'Electricidad',
  'Carpinter\u00eda',
  'Alba\u00f1iler\u00eda',
  'Refrigeraci\u00f3n',
  'Pintura',
  'Herrer\u00eda',
]

const Technicians = () => {
  const { user, isAuthenticated, setAuthState } = useAuth()
  const [filters, setFilters] = useState({ q: '', specialty: undefined, rating: undefined })
  const [technicians, setTechnicians] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [activeRepairs, setActiveRepairs] = useState([])
  const [loadingActiveRepairs, setLoadingActiveRepairs] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const initialTab = useMemo(
    () => (location.hash === '#postulate' ? 'apply' : 'directory'),
    [location.hash],
  )
  const [activeTab, setActiveTab] = useState(initialTab)
  const [form] = Form.useForm()
  const [messageForm] = Form.useForm()
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [availableRequests, setAvailableRequests] = useState([])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const { q, specialty } = filters

  const formatRequestOption = (request) => {
    if (!request) return ''
    const scheduledLabel = request.scheduledAt
      ? new Date(request.scheduledAt).toLocaleDateString('es-MX')
      : 'Sin fecha asignada'
    const title = request.title ?? 'Solicitud sin título'
    return `${title} · ${scheduledLabel}`
  }

  const requestOptions = useMemo(
    () => availableRequests.map((request) => ({
      value: request._id,
      label: formatRequestOption(request),
    })),
    [availableRequests],
  )

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data } = await api.get('/technicians', {
          params: {
            q: q || undefined,
            specialty: specialty || undefined,
          },
        })
        const normalized = (data.technicians || []).map((item) => {
          const techProfile = item.technicianProfile || {}
          const specialties = techProfile.specialties && techProfile.specialties.length
            ? techProfile.specialties
            : ['Especialidad no definida']
          return {
            ...item,
            specialties,
            location: item.profile?.address || techProfile.serviceAreas?.[0] || 'Sin ubicación',
            rating: techProfile.rating || { average: 0, count: 0 },
            bio: techProfile.bio || 'Sin descripción disponible.',
            experienceYears: techProfile.experienceYears || 0,
            skills: techProfile.skills || [],
            avatar: resolveAvatarUrl(item.profile?.avatar),
          }
        })
        setTechnicians(normalized)
      } catch (error) {
        console.error('fetch technicians error', error)
        message.error('No fue posible cargar los t\u00e9cnicos.')
      }
    }
    fetchTechnicians()
  }, [q, specialty])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'client') {
      setActiveRepairs([])
      return
    }
    const loadActiveRepairs = async () => {
      setLoadingActiveRepairs(true)
      try {
        const { data } = await api.get('/service-request')
        const active = (data.requests || []).filter((request) => {
          const status = request.status
          if (!['accepted', 'in_progress'].includes(status)) {
            return false
          }
          const technicianId = request.technician?._id ?? request.technician
          return Boolean(technicianId)
        })
        setActiveRepairs(active)
      } catch (error) {
        console.error('fetch active repairs error', error)
        message.error('No se pudieron obtener tus reparaciones activas.')
      } finally {
        setLoadingActiveRepairs(false)
      }
    }
    loadActiveRepairs()
  }, [isAuthenticated, user?.role])

  const filteredTechnicians = useMemo(() => {
    if (!filters.rating) {
      return technicians
    }
    return technicians.filter((technician) => (technician.rating?.average ?? 0) >= filters.rating)
  }, [technicians, filters.rating])

  const handleSubmit = async (values) => {
    if (!isAuthenticated) {
      message.warning('Inicia sesi\u00f3n para completar tu perfil t\u00e9cnico.')
      navigate('/login')
      return
    }
    setSubmitting(true)
    try {
      const { profile, ...restValues } = values
      const payload = {
        ...restValues,
        specialties: values.specialties,
        availability: values.availability,
        portfolio: values.portfolio,
      }
      const response = await api.post('/technicians/register', payload)
      setAuthState((prev) => ({ ...prev, user: response.data.user }))
      message.success('Solicitud enviada. Nuestro equipo validará tu perfil.')
      form.resetFields()
    } catch (error) {
      console.error('become technician error', error)
      message.error('No se pudo enviar tu solicitud, intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const openMessageModal = (technician, relatedRequests = []) => {
    if (!relatedRequests.length) {
      message.info('Necesitas una reparación activa con este técnico para iniciar un chat.')
      return
    }
    setSelectedTechnician(technician)
    setAvailableRequests(relatedRequests)
    setMessageModalOpen(true)
    messageForm.resetFields()
    if (relatedRequests[0]?._id) {
      messageForm.setFieldsValue({ serviceRequestId: relatedRequests[0]._id })
    }
  }

  const handleSendMessage = async () => {
    try {
      const values = await messageForm.validateFields()
      if (!selectedTechnician?._id) {
        message.error('Selecciona un técnico válido')
        return
      }
      setSendingMessage(true)
      const { data } = await api.post('/conversations', {
        participantId: selectedTechnician._id,
        serviceRequestId: values.serviceRequestId,
        message: values.body,
      })
      message.success('Mensaje enviado')
      setMessageModalOpen(false)
      setSelectedTechnician(null)
      setAvailableRequests([])
      messageForm.resetFields()
      if (data?.conversation?._id) {
        navigate(`/chats?conversation=${data.conversation._id}`)
      }
    } catch (error) {
      if (error?.errorFields) return
      console.error('send message error', error)
      message.error('No se pudo enviar el mensaje')
    } finally {
      setSendingMessage(false)
    }
  }

  const onTabChange = (key) => {
    setActiveTab(key)
    navigate(key === 'apply' ? '/technicians#postulate' : '/technicians', { replace: true })
  }

  return (
    <>
      <Tabs
      activeKey={activeTab}
      onChange={onTabChange}
      items={[
        {
          key: 'directory',
          label: (
            <Flex align="center" gap={8}>
              <TeamOutlined style={{ color: 'var(--ff-accent)' }} />
              Directorio de técnicos
            </Flex>
          ),
          children: (
            <Flex vertical gap={24}>
              <Card className="ff-surface">
                <Flex vertical gap={16}>
                  <Title level={3} style={{ margin: 0 }}>Explora técnicos disponibles</Title>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    Usa los filtros para encontrar especialistas por ciudad, categor\u00eda o nombre.
                  </Paragraph>
                  <Flex gap={16} wrap="wrap">
                    <Input.Search
                      placeholder="Busca por especialidad, nombre o ciudad"
                      allowClear
                      onSearch={(value) => setFilters((prev) => ({ ...prev, q: value }))}
                      style={{ minWidth: 280, maxWidth: 360 }}
                    />
                    <Select
                      placeholder="Especialidad"
                      style={{ minWidth: 220 }}
                      allowClear
                      onChange={(value) => setFilters((prev) => ({ ...prev, specialty: value || undefined }))}
                      options={[
                        { label: 'Todos', value: undefined },
                        ...specialtyOptions.map((option) => ({ label: option, value: option })),
                      ]}
                    />
                    <Flex align="center" gap={8}>
                      <Text strong>Calificación mínima:</Text>
                      <Rate
                        allowClear
                        allowHalf={false}
                        value={filters.rating}
                        onChange={(value) => setFilters((prev) => ({ ...prev, rating: value || undefined }))}
                      />
                    </Flex>
                  </Flex>
                </Flex>
              </Card>
              {filteredTechnicians.length === 0 ? (
                <Empty description="Sin t\u00e9cnicos para los filtros seleccionados" />
              ) : (
                <Row gutter={[24, 24]}>
                  {filteredTechnicians.map((technician) => {
                    const relatedRequests = activeRepairs.filter((request) => {
                      const assignedId = request.technician?._id ?? request.technician
                      return String(assignedId) === String(technician._id)
                    })
                    const canChat = relatedRequests.length > 0
                    return (
                      <Col xs={24} md={12} key={technician._id}>
                        <TechnicianCard
                          technician={technician}
                          actions={
                            isAuthenticated && user?.role === 'client' && String(user?._id) !== String(technician._id) ? (
                              <Button
                                type={canChat ? 'primary' : 'default'}
                                onClick={() => openMessageModal(technician, relatedRequests)}
                                loading={loadingActiveRepairs}
                              >
                                {canChat ? 'Abrir chat' : 'Chat no disponible'}
                              </Button>
                            ) : null
                          }
                        />
                      </Col>
                    )
                  })}
                </Row>
              )}
            </Flex>
          ),
        },
        {
          key: 'apply',
          label: (
            <Flex align="center" gap={8}>
              <ToolOutlined style={{ color: 'var(--ff-accent)' }} />
              Postualate como técnico
            </Flex>
          ),
          children: (
            <Card id="postulate" className="ff-surface">
              <Flex vertical gap={16}>
                <Title level={3} style={{ margin: 0 }}>Convierte tu experiencia en oportunidades</Title>
                <Paragraph type="secondary">
                  Completa el formulario y valida tus datos. Una vez aprobado, tu perfil aparecer\u00e1 en el directorio.
                </Paragraph>
                {!isAuthenticated && (
                  <Card type="inner" style={{ borderColor: 'var(--ff-primary)' }}>
                    <Text strong>\u00bfA\u00fan no tienes cuenta?</Text>{' '}
                    <Button type="link" onClick={() => navigate('/register')}>
                      Reg\u00edstrate aqu\u00ed
                    </Button>
                  </Card>
                )}
                <Form
                  layout="vertical"
                  form={form}
                  onFinish={handleSubmit}
                  initialValues={{
                    avatar: user?.profile?.avatar,
                    specialties: user?.technicianProfile?.specialties,
                    experienceYears: user?.technicianProfile?.experienceYears,
                    bio: user?.technicianProfile?.bio,
                    skills: user?.technicianProfile?.skills,
                    serviceAreas: user?.technicianProfile?.serviceAreas,
                    availability: user?.technicianProfile?.availability,
                    portfolio: user?.technicianProfile?.portfolio,
                  }}
                >
                  <Form.Item
                    label="Especialidades"
                    name="specialties"
                    rules={[{ required: true, message: 'Selecciona al menos una especialidad' }]}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Elige una o varias especialidades"
                      options={specialtyOptions.map((label) => ({ label, value: label }))}
                    />
                  </Form.Item>
                  <Form.Item
                    label="A\u00f1os de experiencia"
                    name="experienceYears"
                    rules={[{ required: true, message: 'Indica tus a\u00f1os de experiencia' }]}
                  >
                    <Input type="number" min={0} placeholder="Ej. 5" />
                  </Form.Item>
                  <Divider orientation="left">Disponibilidad</Divider>
                  <Form.List name="availability">
                    {(fields, { add, remove }) => (
                      <Flex vertical gap={16}>
                        {fields.map(({ key, name, ...restField }) => (
                          <Card key={key} type="inner" title={`Horario ${key + 1}`} extra={<Button type="link" danger onClick={() => remove(name)}>Eliminar</Button>}>
                            <Flex gap={16} wrap="wrap">
                              <Form.Item
                                {...restField}
                                label="DÃ­a"
                                name={[name, 'day']}
                                rules={[{ required: true, message: 'Selecciona un dÃ­a' }]}
                              >
                                <Select
                                  placeholder="Selecciona un dÃ­a"
                                  options={[
                                    'Lunes', 'Martes', 'MiÃ©rcoles', 'Jueves', 'Viernes', 'SÃ¡bado', 'Domingo',
                                  ].map((day) => ({ label: day, value: day }))}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                label="Hora inicio"
                                name={[name, 'startHour']}
                                rules={[{ required: true, message: 'Indica la hora de inicio' }]}
                              >
                                <Input placeholder="09:00" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                label="Hora fin"
                                name={[name, 'endHour']}
                                rules={[{ required: true, message: 'Indica la hora de cierre' }]}
                              >
                                <Input placeholder="18:00" />
                              </Form.Item>
                            </Flex>
                          </Card>
                        ))}
                        <Button type="dashed" onClick={() => add()} block>
                          Agregar horario
                        </Button>
                      </Flex>
                    )}
                  </Form.List>
                  <Form.Item
                    label="Biograf\u00eda o descripci\u00f3n del servicio"
                    name="bio"
                    rules={[{ required: true, message: 'Describe tus servicios' }]}
                  >
                    <Input.TextArea rows={4} placeholder="Destaca tu experiencia, certificaciones y proyectos." />
                  </Form.Item>
                  <Form.Item
                    label="Habilidades"
                    name="skills"
                    rules={[{ required: true, message: 'Indica tus habilidades principales' }]}
                  >
                    <Select mode="tags" placeholder="Ej. Instalaciones, mantenimiento, diagn\u00f3sticos" />
                  </Form.Item>
                  <Form.Item
                    label="Zonas de cobertura"
                    name="serviceAreas"
                    rules={[{ required: true, message: 'Indica tus zonas de trabajo' }]}
                  >
                    <Select mode="tags" placeholder="Ej. CDMX, Toluca, Puebla" />
                  </Form.Item>
                  <Form.Item label="Certificaciones o documentos">
                    <Upload.Dragger beforeUpload={() => false} multiple maxCount={3}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Haz clic o arrastra archivos para subir</p>
                      <p className="ant-upload-hint">Aceptamos PDF, JPG o PNG (m\u00e1x. 5MB).</p>
                    </Upload.Dragger>
                  </Form.Item>
                  <Divider orientation="left">Portafolio</Divider>
                  <Form.List name="portfolio">
                    {(fields, { add, remove }) => (
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {fields.map(({ key, name, ...restField }) => (
                          <Card key={key} type="inner" title={`Proyecto ${key + 1}`} extra={<Button type="link" danger onClick={() => remove(name)}>Eliminar</Button>}>
                            <Form.Item
                              {...restField}
                              label="TÃ­tulo del proyecto"
                              name={[name, 'title']}
                              rules={[{ required: true, message: 'Agrega un tÃ­tulo' }]}
                            >
                              <Input placeholder="Ej. InstalaciÃ³n elÃ©ctrica en oficina" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              label="descripción breve"
                              name={[name, 'description']}
                            >
                              <Input.TextArea rows={3} placeholder="Describe el alcance, materiales y resultados." />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              label="Enlace a foto o evidencia"
                              name={[name, 'imageUrl']}
                            >
                              <Input placeholder="https://drive.google.com/..." />
                            </Form.Item>
                          </Card>
                        ))}
                        <Button type="dashed" onClick={() => add()} block>
                          Agregar proyecto
                        </Button>
                      </Space>
                    )}
                  </Form.List>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit" size="large" loading={submitting}>
                      Enviar solicitud
                    </Button>
                  </Form.Item>
                </Form>
              </Flex>
            </Card>
          ),
        },
      ]}
    />
      <Modal
        title={selectedTechnician ? `Mensaje para ${selectedTechnician.profile.fullName}` : 'Nuevo mensaje'}
        open={messageModalOpen}
        okText="Enviar"
        cancelText="Cancelar"
        confirmLoading={sendingMessage}
        onOk={handleSendMessage}
        onCancel={() => {
          setMessageModalOpen(false)
          messageForm.resetFields()
          setSelectedTechnician(null)
          setAvailableRequests([])
        }}
      >
        <Form form={messageForm} layout="vertical">
          <Form.Item
            label="Reparación activa"
            name="serviceRequestId"
            rules={[{ required: true, message: 'Selecciona la reparación relacionada' }]}
          >
            <Select
              placeholder="Selecciona la reparación vinculada"
              options={requestOptions}
            />
          </Form.Item>
          <Form.Item
            label="Mensaje"
            name="body"
            rules={[{ required: true, message: 'Escribe un mensaje' }]}
          >
            <Input.TextArea rows={4} placeholder="Describe tu propuesta o consulta." />
          </Form.Item>
          <Text type="secondary">
            El chat se guarda durante la reparación y se elimina una semana después de finalizarla.
          </Text>
        </Form>
      </Modal>
    </>
  )
}

export default Technicians
