import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Card,
  Form,
  Input,
  DatePicker,
  Button,
  Select,
  Typography,
  message,
  Tabs,
  List,
  Tag,
  Empty,
  Spin,
  Flex,
  Space,
  InputNumber,
  Switch,
  Tooltip,
} from 'antd'
import dayjs from 'dayjs'
import api from '../utils/api.js'
import useAuth from '../hooks/useAuth.js'

const { Title, Paragraph, Text } = Typography

const categories = [
  'Plomer\u00eda',
  'Electricidad',
  'Carpinter\u00eda',
  'Alba\u00f1iler\u00eda',
  'Pintura',
]

const categoryFieldConfig = {
  'Plomer\u00eda': [
    {
      name: 'plumbingProblemType',
      label: 'Tipo de problema',
      type: 'select',
      options: [
        { label: 'Fuga de agua', value: 'fuga' },
        { label: 'Baja presi\u00f3n', value: 'presion' },
        { label: 'Tuber\u00eda obstruida', value: 'obstruccion' },
        { label: 'Instalaci\u00f3n', value: 'instalacion' },
        { label: 'Otro', value: 'otro' },
      ],
      rules: [{ required: true, message: 'Selecciona el tipo de problema' }],
    },
    {
      name: 'plumbingLocation',
      label: 'Ubicaci\u00f3n del problema',
      placeholder: 'Cocina, ba\u00f1o principal, jard\u00edn, etc.',
      type: 'text',
      rules: [{ required: true, message: 'Describe d\u00f3nde ocurre el problema' }],
    },
    {
      name: 'plumbingHasShutoff',
      label: '\u00bfPodemos cerrar la llave de paso?',
      type: 'switch',
      tooltip: 'Indica si puedes cerrar el suministro de agua cuando llegue el t\u00e9cnico.',
    },
  ],
  Electricidad: [
    {
      name: 'electricalIssueType',
      label: 'Tipo de instalaci\u00f3n/falla',
      type: 'select',
      options: [
        { label: 'Cortocircuito', value: 'short' },
        { label: 'Apagadores y contactos', value: 'switches' },
        { label: 'Centro de carga', value: 'panel' },
        { label: 'Alumbrado', value: 'lighting' },
        { label: 'Otro', value: 'other' },
      ],
      rules: [{ required: true, message: 'Selecciona el tipo de trabajo el\u00e9ctrico' }],
    },
    {
      name: 'electricalCircuits',
      label: 'N\u00famero de circuitos afectados',
      type: 'number',
      min: 0,
      tooltip: 'Si no est\u00e1s seguro, puedes dejarlo en 0.',
    },
    {
      name: 'electricalHasPower',
      label: '\u00bfHay energ\u00eda el\u00e9ctrica en la zona?',
      type: 'switch',
    },
  ],
  'Carpinter\u00eda': [
    {
      name: 'carpentryPieceType',
      label: 'Tipo de mueble o estructura',
      type: 'text',
      placeholder: 'Closet, puerta, gabinete, repisa\u2026',
      rules: [{ required: true, message: 'Describe la pieza a trabajar' }],
    },
    {
      name: 'carpentryMaterial',
      label: 'Material principal',
      type: 'select',
      options: [
        { label: 'Madera s\u00f3lida', value: 'solid' },
        { label: 'MDF/aglomerado', value: 'mdf' },
        { label: 'Melamina', value: 'melamine' },
        { label: 'Otro', value: 'other' },
      ],
      rules: [{ required: true, message: 'Selecciona el material principal' }],
    },
    {
      name: 'carpentryFinishNeeded',
      label: '\u00bfRequiere acabado o barniz?',
      type: 'switch',
    },
  ],
  'Alba\u00f1iler\u00eda': [
    {
      name: 'masonryWorkType',
      label: 'Tipo de trabajo',
      type: 'select',
      options: [
        { label: 'Reparaci\u00f3n de muro', value: 'wall_repair' },
        { label: 'Piso o loseta', value: 'flooring' },
        { label: 'Impermeabilizaci\u00f3n', value: 'waterproof' },
        { label: 'Construcci\u00f3n ligera', value: 'light_construction' },
        { label: 'Otro', value: 'other' },
      ],
      rules: [{ required: true, message: 'Selecciona el tipo de trabajo a realizar' }],
    },
    {
      name: 'masonrySurfaceSize',
      label: '\u00c1rea aproximada (m\u00b2)',
      type: 'number',
      min: 1,
      tooltip: 'Indica la superficie de trabajo aproximada.',
      rules: [{ required: true, message: 'Indica el \u00e1rea aproximada' }],
    },
    {
      name: 'masonryNeedsMaterial',
      label: '\u00bfNecesitas que el t\u00e9cnico proporcione materiales?',
      type: 'switch',
    },
  ],
  Pintura: [
    {
      name: 'paintingAreaType',
      label: '\u00c1rea a pintar',
      type: 'select',
      options: [
        { label: 'Interior', value: 'interior' },
        { label: 'Exterior', value: 'exterior' },
        { label: 'Muebles/objetos', value: 'objects' },
      ],
      rules: [{ required: true, message: 'Selecciona el tipo de superficie a pintar' }],
    },
    {
      name: 'paintingSurfaceSize',
      label: 'Superficie aproximada (m\u00b2)',
      type: 'number',
      min: 1,
      tooltip: 'Una estimaci\u00f3n ayuda a cotizar con mayor precisi\u00f3n.',
      rules: [{ required: true, message: 'Indica la superficie a pintar' }],
    },
    {
      name: 'paintingHasPaint',
      label: '\u00bfYa cuentas con la pintura?',
      type: 'switch',
    },
  ],
}

const statusColor = {
  pending: 'orange',
  accepted: 'blue',
  in_progress: 'gold',
  completed: 'green',
  cancelled: 'red',
}

const statusLabels = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const formatAddress = (address) => [
  address.street,
  address.city,
  address.state,
  address.zipCode,
].filter(Boolean).join(', ')

const formatDate = (value) => {
  if (!value) return 'Sin fecha'
  const date = dayjs(value)
  return date.isValid() ? date.format('DD/MM/YYYY') : 'Sin fecha'
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '$0.00'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

const ServiceRequest = () => {
  const [form] = Form.useForm()
  const { user } = useAuth()
  const savedAddresses = user?.clientProfile?.addresses ?? []
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [requestsByStatus, setRequestsByStatus] = useState({
    pending: [],
    quoted: [],
    accepted: [],
  })
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [offerActionLoading, setOfferActionLoading] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeTabKey, setActiveTabKey] = useState('create')
  const currentCategoryFields = useMemo(
    () => categoryFieldConfig[activeCategory] ?? [],
    [activeCategory],
  )

  const userId = user?._id
  const userRole = user?.role

  const loadRequests = useCallback(async () => {
    if (!userId || userRole !== 'client') return
    setRequestsLoading(true)
    try {
      const { data } = await api.get('/service-request')
      const requests = Array.isArray(data.requests) ? data.requests : []

      const offersEntries = await Promise.all(
        requests.map(async (request) => {
          const requestId = request._id ?? request.id ?? request
          if (!requestId) return [requestId, []]
          try {
            const { data: offersData } = await api.get(`/service-request/${requestId}/offers`)
            return [requestId, offersData.offers ?? []]
          } catch (error) {
            console.error('service request offers error', error)
            return [requestId, []]
          }
        }),
      )

      const offersMap = Object.fromEntries(offersEntries.filter(([id]) => id))

      const enriched = requests.map((request) => {
        const id = request._id ?? request.id ?? request
        const offers = offersMap[id] ?? []
        const normalizedOffers = offers.map((offer) => {
          const technician = offer.technician ?? {}
          return {
            id: offer._id ?? offer.id ?? '',
            amount: offer.amount ?? 0,
            message: offer.message ?? '',
            status: offer.status ?? 'pending',
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt,
            technician: technician
              ? {
                id: technician._id ?? technician.id ?? '',
                fullName: technician.profile?.fullName ?? 'T\u00e9cnico FixFinder',
                specialties: technician.technicianProfile?.specialties ?? [],
              }
              : null,
          }
        })
        const pendingOffers = normalizedOffers.filter((offer) => offer.status === 'pending')
        const acceptedOffer = normalizedOffers.find((offer) => offer.status === 'accepted') ?? null
        return {
          id,
          title: request.title ?? 'Solicitud de servicio',
          status: request.status ?? 'pending',
          category: request.category ?? 'General',
          address: request.address,
          scheduledAt: request.scheduledAt,
          createdAt: request.createdAt,
          offers: normalizedOffers,
          pendingOffers,
          acceptedOffer,
          offersCount: pendingOffers.length,
          totalOffers: normalizedOffers.length,
        }
      })

      const pending = enriched.filter((item) => item.status === 'pending' && item.offersCount === 0)
      const quoted = enriched.filter((item) => item.status === 'pending' && item.offersCount > 0)
      const accepted = enriched.filter((item) => ['accepted', 'in_progress', 'completed'].includes(item.status))

      setRequestsByStatus({ pending, quoted, accepted })
    } catch (error) {
      console.error('client requests fetch error', error)
      message.error('No se pudieron obtener tus solicitudes')
    } finally {
      setRequestsLoading(false)
    }
  }, [userId, userRole])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleAddressPrefill = (value) => {
    const selected = savedAddresses.find((address) => {
      const identifier = address.label ?? `${address.street}-${address.city}`
      return identifier === value
    })
    if (selected) {
      form.setFieldsValue({ address: formatAddress(selected) })
      setSelectedSavedAddress(selected)
    } else {
      setSelectedSavedAddress(null)
    }
  }

  const handleCategoryChange = (value) => {
    if (activeCategory && activeCategory !== value) {
      const prevFieldNames = (categoryFieldConfig[activeCategory] ?? []).map((field) => field.name)
      if (prevFieldNames.length) {
        form.resetFields(prevFieldNames)
      }
    }
    if (!value) {
      setActiveCategory(null)
      return
    }
    setActiveCategory(value)
  }

  const handleSubmit = async (values) => {
    try {
      const { savedAddress: _savedAddress, scheduledAt, ...rest } = values
      setSubmitting(true)
      const categoryFieldNames = new Set(
        (categoryFieldConfig[values.category] ?? []).map((field) => field.name),
      )

      const baseValues = {}
      const categoryDetails = {}

      Object.entries(rest).forEach(([key, value]) => {
        if (categoryFieldNames.has(key)) {
          if (value !== undefined && value !== null && value !== '') {
            categoryDetails[key] = value
          }
        } else {
          baseValues[key] = value
        }
      })

      const payload = {
        ...baseValues,
        scheduledAt: scheduledAt?.toISOString(),
        ...(selectedSavedAddress ? { addressDetails: selectedSavedAddress } : {}),
        ...(Object.keys(categoryDetails).length ? { categoryDetails } : {}),
      }
      await api.post('/service-request', payload)
      message.success('Solicitud enviada correctamente')
      form.resetFields()
      setSelectedSavedAddress(null)
      setActiveCategory(null)
      await loadRequests()
      setActiveTabKey('pending')
    } catch (error) {
      console.error('service request error', error)
      message.error('No se pudo crear la solicitud, intenta m\u00e1s tarde')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptOffer = async (requestId, offerId) => {
    const actionKey = `accept:${offerId}`
    setOfferActionLoading(actionKey)
    try {
      await api.patch(`/service-request/${requestId}/offers/${offerId}/accept`)
      message.success('Cotizaci\u00f3n aceptada')
      await loadRequests()
    } catch (error) {
      console.error('accept offer action error', error)
      const errorMessage = error?.response?.data?.message ?? 'No se pudo aceptar la oferta'
      message.error(errorMessage)
    } finally {
      setOfferActionLoading(null)
    }
  }

  const handleRejectOffer = async (requestId, offerId) => {
    const actionKey = `reject:${offerId}`
    setOfferActionLoading(actionKey)
    try {
      await api.patch(`/service-request/${requestId}/offers/${offerId}/reject`)
      message.info('Cotizaci\u00f3n rechazada')
      await loadRequests()
    } catch (error) {
      console.error('reject offer action error', error)
      const errorMessage = error?.response?.data?.message ?? 'No se pudo rechazar la oferta'
      message.error(errorMessage)
    } finally {
      setOfferActionLoading(null)
    }
  }

  const renderCategoryField = (field) => {
    const labelContent = field.tooltip ? (
      <Tooltip title={field.tooltip}>
        <span>{field.label}</span>
      </Tooltip>
    ) : field.label

    const commonRules = field.rules ?? []

    if (field.type === 'switch') {
      return (
        <Form.Item
          key={field.name}
          label={labelContent}
          name={field.name}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      )
    }

    if (field.type === 'number') {
      return (
        <Form.Item
          key={field.name}
          label={labelContent}
          name={field.name}
          rules={commonRules}
        >
          <InputNumber
            min={field.min}
            max={field.max}
            style={{ width: '100%' }}
            placeholder={field.placeholder}
          />
        </Form.Item>
      )
    }

    if (field.type === 'select') {
      return (
        <Form.Item
          key={field.name}
          label={labelContent}
          name={field.name}
          rules={commonRules}
        >
          <Select
            placeholder={field.placeholder ?? 'Selecciona una opci\u00f3n'}
            options={field.options}
            allowClear
          />
        </Form.Item>
      )
    }

    if (field.type === 'textarea') {
      return (
        <Form.Item
          key={field.name}
          label={labelContent}
          name={field.name}
          rules={commonRules}
        >
          <Input.TextArea
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
          />
        </Form.Item>
      )
    }

    // default to text input
    return (
      <Form.Item
        key={field.name}
        label={labelContent}
        name={field.name}
        rules={commonRules}
      >
        <Input placeholder={field.placeholder} />
      </Form.Item>
    )
  }

  const renderRequestsList = (items, emptyDescription) => {
    if (requestsLoading) {
      return (
        <Flex justify="center" align="center" style={{ minHeight: 160 }}>
          <Spin tip="Cargando solicitudes..." />
        </Flex>
      )
    }

    if (!items.length) {
      return <Empty description={emptyDescription} />
    }

    return (
      <List
        dataSource={items}
        renderItem={(item) => {
          const offersLabelCount = item.status === 'pending'
            ? item.offersCount ?? 0
            : item.totalOffers ?? item.offersCount ?? 0
          return (
            <List.Item
              key={item.id}
              actions={[
                <Tag key="status" color={statusColor[item.status] ?? 'default'}>
                  {statusLabels[item.status] ?? item.status}
                </Tag>,
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={(
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">Categor\u00eda: {item.category}</Text>
                    <Text type="secondary">Programada: {formatDate(item.scheduledAt)}</Text>
                    {item.address && (
                      <Text type="secondary">Direcci\u00f3n: {item.address}</Text>
                    )}
                  </Space>
                )}
              />
              <Space direction="vertical" style={{ textAlign: 'right' }}>
                <Text type="secondary">Creada: {formatDate(item.createdAt)}</Text>
                <Text type="secondary">
                  {offersLabelCount} {offersLabelCount === 1 ? 'cotizaci\u00f3n' : 'cotizaciones'}
                </Text>
              </Space>
            </List.Item>
          )
        }}
      />
    )
  }

  const renderQuotedRequests = () => {
    if (requestsLoading) {
      return (
        <Flex justify="center" align="center" style={{ minHeight: 160 }}>
          <Spin tip="Cargando solicitudes..." />
        </Flex>
      )
    }

    if (!requestsByStatus.quoted.length) {
      return <Empty description="Aqu\u00ed ver\u00e1s tus solicitudes con cotizaciones disponibles." />
    }

    return (
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {requestsByStatus.quoted.map((request) => {
          const offers = request.pendingOffers ?? []
          return (
            <Card key={request.id} className="ff-surface">
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Flex justify="space-between" align="flex-start" wrap>
                  <Space direction="vertical" size={4}>
                    <Text strong>{request.title}</Text>
                    <Space size={8} wrap>
                      <Tag color="processing">{request.category}</Tag>
                      <Text type="secondary">Programada: {formatDate(request.scheduledAt)}</Text>
                    </Space>
                    {request.address && (
                      <Text type="secondary">Direcci\u00f3n: {request.address}</Text>
                    )}
                  </Space>
                  <Text type="secondary">Creada: {formatDate(request.createdAt)}</Text>
                </Flex>
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  {offers.length === 0 ? (
                    <Empty description="No hay cotizaciones activas en este momento." />
                  ) : (
                    offers.map((offer) => {
                      const acceptKey = `accept:${offer.id}`
                      const rejectKey = `reject:${offer.id}`
                      const isProcessingCurrent = offerActionLoading === acceptKey || offerActionLoading === rejectKey
                      const disableOtherActions = offerActionLoading !== null && !isProcessingCurrent
                      return (
                        <Card key={offer.id} type="inner">
                          <Flex justify="space-between" align="flex-start" gap={16} wrap>
                            <Space direction="vertical" size={4} style={{ flex: 1, minWidth: 220 }}>
                              <Text strong>{offer.technician?.fullName ?? 'T\u00e9cnico FixFinder'}</Text>
                              {offer.technician?.specialties?.length ? (
                                <Text type="secondary">
                                  {offer.technician.specialties.join(', ')}
                                </Text>
                              ) : null}
                              {offer.message ? (
                                <Paragraph style={{ marginBottom: 0 }}>
                                  <Text strong>Mensaje:</Text> {offer.message}
                                </Paragraph>
                              ) : (
                                <Text type="secondary">Sin mensaje adicional.</Text>
                              )}
                              {offer.technician?.profile?.phoneNumber && (
                                <Text type="secondary">
                                  Tel\u00e9fono: {offer.technician.profile.phoneNumber}
                                </Text>
                              )}
                              {offer.technician?.profile?.email && (
                                <Text type="secondary">
                                  Correo: {offer.technician.profile.email}
                                </Text>
                              )}
                            </Space>
                            <Space direction="vertical" align="end" size={8} style={{ minWidth: 180 }}>
                              <Text strong style={{ fontSize: 18 }}>
                                {formatCurrency(offer.amount)}
                              </Text>
                              <Text type="secondary">Enviada: {formatDate(offer.createdAt)}</Text>
                              <Space>
                                <Button
                                  danger
                                  onClick={() => handleRejectOffer(request.id, offer.id)}
                                  loading={offerActionLoading === rejectKey}
                                  disabled={disableOtherActions}
                                >
                                  Rechazar
                                </Button>
                                <Button
                                  type="primary"
                                  onClick={() => handleAcceptOffer(request.id, offer.id)}
                                  loading={offerActionLoading === acceptKey}
                                  disabled={disableOtherActions}
                                >
                                  Aceptar
                                </Button>
                              </Space>
                            </Space>
                          </Flex>
                        </Card>
                      )
                    })
                  )}
                </Space>
              </Space>
            </Card>
          )
        })}
      </Space>
    )
  }

  const tabsItems = [
    {
      key: 'create',
      label: 'Crear solicitud de servicio',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>Crear solicitud de servicio</Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Describe el problema o proyecto. Notificaremos a t\u00e9cnicos disponibles en tu zona.
            </Paragraph>
          </div>
          <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            initialValues={{
              contactName: user?.profile?.fullName,
            }}
          >
            <Form.Item
              label="T\u00edtulo"
              name="title"
              rules={[{ required: true, message: 'Describe brevemente la solicitud' }]}
            >
              <Input placeholder="Ej. Reparaci\u00f3n de fuga bajo lavabo" />
            </Form.Item>
            <Form.Item
              label="Categor\u00eda"
              name="category"
              rules={[{ required: true, message: 'Selecciona una categor\u00eda' }]}
            >
              <Select
                placeholder="Selecciona"
                options={categories.map((value) => ({ value, label: value }))}
                onChange={handleCategoryChange}
              />
            </Form.Item>
            {currentCategoryFields.length > 0 && (
              <>
                <Text strong style={{ display: 'block' }}>
                  Detalles espec\u00edficos para {activeCategory?.toLowerCase?.() ?? ''}
                </Text>
                {currentCategoryFields.map((field) => renderCategoryField(field))}
              </>
            )}
            {savedAddresses.length > 0 && (
              <Form.Item label="Direcci\u00f3n guardada" name="savedAddress">
                <Select
                  placeholder="Selecciona una direcci\u00f3n"
                  allowClear
                  options={savedAddresses.map((address) => ({
                    label: address.label ?? formatAddress(address),
                    value: address.label ?? `${address.street}-${address.city}`,
                  }))}
                  onChange={handleAddressPrefill}
                />
              </Form.Item>
            )}
            <Form.Item
              label="Descripci\u00f3n"
              name="description"
              rules={[
                { required: true, message: 'Detalla tu solicitud' },
                { min: 20, message: 'Agrega al menos 20 caracteres para describir tu solicitud' },
              ]}
            >
              <Input.TextArea rows={4} placeholder="Agrega detalles, accesos, materiales o s\u00edntomas." />
            </Form.Item>
            <Form.Item
              label="Direcci\u00f3n"
              name="address"
              rules={[
                { required: true, message: 'Indica la direcci\u00f3n del servicio' },
                { min: 5, message: 'Incluye m\u00e1s detalles en la direcci\u00f3n' },
              ]}
            >
              <Input
                placeholder="Colonia, calle y referencias"
                onChange={() => {
                  if (selectedSavedAddress) {
                    setSelectedSavedAddress(null)
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              label="Fecha tentativa"
              name="scheduledAt"
              rules={[{ required: true, message: 'Selecciona una fecha tentativa' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
            <Form.Item
              label="Nombre de contacto"
              name="contactName"
              rules={[{ required: true, message: 'Ingresa un nombre' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                Enviar solicitud
              </Button>
            </Form.Item>
          </Form>
        </Space>
      ),
    },
    {
      key: 'pending',
      label: 'Solicitudes pendientes',
      children: renderRequestsList(
        requestsByStatus.pending,
        'No tienes solicitudes pendientes por cotizar en este momento.',
      ),
    },
    {
      key: 'quoted',
      label: 'Cotizadas',
      children: renderQuotedRequests(),
    },
    {
      key: 'accepted',
      label: 'Aceptadas',
      children: renderRequestsList(
        requestsByStatus.accepted,
        'A\u00fan no has aceptado ninguna cotizaci\u00f3n.',
      ),
    },
  ]

  return (
    <Card>
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        items={tabsItems}
      />
    </Card>
  )
}

export default ServiceRequest
