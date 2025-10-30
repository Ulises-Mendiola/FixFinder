import { Card, Form, Input, DatePicker, Button, Select, Typography } from 'antd'
import api from '../utils/api.js'
import useAuth from '../hooks/useAuth.js'

const { Title, Paragraph } = Typography

const categories = [
  'Plomería',
  'Electricidad',
  'Carpintería',
  'Albañilería',
  'Pintura',
]

const ServiceRequest = () => {
  const [form] = Form.useForm()
  const { user } = useAuth()

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        scheduledAt: values.scheduledAt?.toISOString(),
      }
      await api.post('/service-request', payload)
      form.resetFields()
    } catch (error) {
      console.error('service request error', error)
    }
  }

  return (
    <Card>
      <Title level={3}>Crear solicitud de servicio</Title>
      <Paragraph type="secondary">
        Describe el problema o proyecto. Notificaremos a técnicos disponibles en tu zona.
      </Paragraph>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{
          contactName: user?.profile?.fullName,
          contactPhone: user?.profile?.phone,
        }}
      >
        <Form.Item
          label="Título"
          name="title"
          rules={[{ required: true, message: 'Describe brevemente la solicitud' }]}
        >
          <Input placeholder="Ej. Reparación de fuga bajo lavabo" />
        </Form.Item>
        <Form.Item
          label="Categoría"
          name="category"
          rules={[{ required: true, message: 'Selecciona una categoría' }]}
        >
          <Select placeholder="Selecciona" options={categories.map((value) => ({ value, label: value }))} />
        </Form.Item>
        <Form.Item
          label="Descripción"
          name="description"
          rules={[{ required: true, message: 'Detalla tu solicitud' }]}
        >
          <Input.TextArea rows={4} placeholder="Agrega detalles, accesos, materiales o síntomas." />
        </Form.Item>
        <Form.Item
          label="Dirección"
          name="address"
          rules={[{ required: true, message: 'Indica la dirección del servicio' }]}
        >
          <Input placeholder="Colonia, calle y referencias" />
        </Form.Item>
        <Form.Item
          label="Fecha tentativa"
          name="scheduledAt"
          rules={[{ required: true, message: 'Selecciona una fecha tentativa' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item
          label="Nombre de contacto"
          name="contactName"
          rules={[{ required: true, message: 'Ingresa un nombre' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Teléfono de contacto"
          name="contactPhone"
          rules={[{ required: true, message: 'Ingresa un teléfono válido' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Enviar solicitud
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ServiceRequest
