import { Form, Input, Button, Card, Flex, Typography, Upload, Select } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import useAuth from '../hooks/useAuth.js'
import api from '../utils/api.js'

const { Title, Paragraph } = Typography

const specialties = [
  'Plomería',
  'Electricidad',
  'Carpintería',
  'Albañilería',
  'Refrigeración',
  'Pintura',
]

const BecomeTechnician = () => {
  const [form] = Form.useForm()
  const { user, setAuthState } = useAuth()

  const handleSubmit = async (values) => {
    try {
      const response = await api.post('/technicians/register', values)
      setAuthState((prev) => ({ ...prev, user: response.data.user }))
    } catch (error) {
      console.error('become technician error', error)
    }
  }

  return (
    <Card>
      <Flex vertical gap={16}>
        <Title level={3}>Convierte tu talento en oportunidades</Title>
        <Paragraph type="secondary">
          Completa el formulario para activar tu perfil profesional. Nuestro equipo verificará tu información antes de publicar tu perfil.
        </Paragraph>
        <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{
          profile: {
            fullName: user?.profile?.fullName,
            phone: user?.profile?.phone,
          },
        }}
        >
          <Form.Item
            label="Especialidad principal"
            name="specialty"
            rules={[{ required: true, message: 'Selecciona una especialidad' }]}
          >
            <Select placeholder="Elige tu especialidad" options={specialties.map((label) => ({ label, value: label }))} />
          </Form.Item>
          <Form.Item
            label="Años de experiencia"
            name="experienceYears"
            rules={[{ required: true, message: 'Indica tus años de experiencia' }]}
          >
            <Input type="number" min={0} placeholder="Ej. 5" />
          </Form.Item>
          <Form.Item
            label="Biografía o descripción del servicio"
            name="bio"
            rules={[{ required: true, message: 'Describe tus servicios' }]}
          >
            <Input.TextArea rows={4} placeholder="Comparte un resumen de tu experiencia, certificaciones y servicios que ofreces." />
          </Form.Item>
          <Form.Item
            label="Zona de cobertura"
            name="serviceAreas"
            rules={[{ required: true, message: 'Indica tus zonas de trabajo' }]}
          >
            <Select mode="tags" placeholder="Ej. CDMX, Toluca, Puebla" />
          </Form.Item>
          <Form.Item
            label="Certificaciones o documentos"
            name="documents"
          >
            <Upload.Dragger beforeUpload={() => false} multiple maxCount={3}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Haz clic o arrastra archivos para subir</p>
              <p className="ant-upload-hint">Aceptamos PDF, JPG o PNG (máx. 5MB).</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large">
              Enviar solicitud
            </Button>
          </Form.Item>
        </Form>
      </Flex>
    </Card>
  )
}

export default BecomeTechnician
