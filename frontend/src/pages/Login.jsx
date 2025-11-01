//ASDF
import { useState } from 'react'
import { Card, Typography, Form, Input, Button, Flex } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const { Title, Text } = Typography

const initialValues = {
  email: '',
  password: '',
}

const Login = () => {
  const { login, loading } = useAuth()
  const [formValues] = useState(initialValues)
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    try {
      await login(values)
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: '70vh' }}>
      <Card style={{ width: 420, boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)' }}>
        <Flex vertical gap={12} style={{ marginBottom: 12 }}>
          <Title level={3} style={{ margin: 0 }}>Bienvenido a FixFinder</Title>
          <Text type="secondary">
            Ingresa tus datos para gestionar tus servicios y solicitudes.
          </Text>
        </Flex>
        <Form layout="vertical" initialValues={formValues} onFinish={handleSubmit}>
          <Form.Item
            label="Correo electrónico"
            name="email"
            rules={[
              { required: true, message: 'Ingresa un correo válido' },
              { type: 'email', message: 'Formato de correo incorrecto' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="tu@correo.com" size="large" />
          </Form.Item>
          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Introduce tu contraseña' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Ingresar
            </Button>
          </Form.Item>
        </Form>
        <Flex justify="space-between">
          <Link to="/register">¿No tienes cuenta? Regístrate</Link>
          <Link to="/reset-password">¿Olvidaste tu contraseña?</Link>
        </Flex>
      </Card>
    </Flex>
  )
}

export default Login
