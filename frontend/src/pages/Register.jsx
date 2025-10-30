import { useState } from 'react'
import { Card, Typography, Form, Input, Button, Flex, Select } from 'antd'
import { UserOutlined, HomeOutlined, PhoneOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const { Title, Text } = Typography

const Register = () => {
  const { register, loading } = useAuth()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [role, setRole] = useState('client')

  const handleSubmit = async (values) => {
    try {
      await register({ ...values, role })
      navigate('/')
    } catch (error) {
      console.error('register error', error)
    }
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: '70vh' }}>
      <Card style={{ width: 520, boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)' }}>
        <Flex vertical gap={12} style={{ marginBottom: 12 }}>
          <Title level={3} style={{ margin: 0 }}>Crea tu cuenta</Title>
          <Text type="secondary">
            Regístrate en FixFinder para solicitar servicios o compartir tu experiencia como técnico.
          </Text>
        </Flex>
        <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{ role: 'client' }}>
          <Form.Item
            label="Nombre completo"
            name={['profile', 'fullName']}
            rules={[{ required: true, message: 'Introduce tu nombre completo' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Juan Pérez" size="large" />
          </Form.Item>
          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[
              { required: true, message: 'Ingresa un correo válido' },
              { type: 'email', message: 'Formato incorrecto' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="tu@correo.com" size="large" />
          </Form.Item>
          <Form.Item
            label="Teléfono"
            name={['profile', 'phone']}
            rules={[{ required: true, message: 'Ingresa un número de contacto' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="55 1234 5678" size="large" />
          </Form.Item>
          <Form.Item
            label="Dirección"
            name={['profile', 'address']}
            rules={[{ required: true, message: 'Indica tu ciudad o colonia' }]}
          >
            <Input prefix={<HomeOutlined />} placeholder="CDMX - Roma Norte" size="large" />
          </Form.Item>
          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: 'Crea una contraseña' },
              { min: 6, message: 'Debe tener al menos 6 caracteres' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>
          <Form.Item label="¿Cómo usarás FixFinder?" name="role">
            <Select
              size="large"
              onChange={setRole}
              options={[
                { label: 'Soy cliente y necesito servicios', value: 'client' },
                { label: 'Soy técnico y busco clientes', value: 'technician' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Crear cuenta
            </Button>
          </Form.Item>
        </Form>
        <Flex justify="center">
          <Text type="secondary">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </Text>
        </Flex>
      </Card>
    </Flex>
  )
}

export default Register
