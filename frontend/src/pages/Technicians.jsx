import { useEffect, useState } from 'react'
import { Input, Select, Row, Col, Flex, Empty } from 'antd'
import api from '../utils/api.js'
import TechnicianCard from '../components/TechnicianCard.jsx'

const Technicians = () => {
  const [filters, setFilters] = useState({ q: '', specialty: undefined })
  const [technicians, setTechnicians] = useState([])

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data } = await api.get('/technicians', {
          params: {
            q: filters.q || undefined,
            specialty: filters.specialty || undefined,
          },
        })
        setTechnicians(data.technicians)
      } catch (error) {
        console.error('fetch technicians error', error)
      }
    }
    fetchTechnicians()
  }, [filters])

  return (
    <Flex vertical gap={24}>
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
          onChange={(value) => setFilters((prev) => ({ ...prev, specialty: value }))}
          options={[
            { label: 'Todos', value: undefined },
            { label: 'Plomería', value: 'Plomería' },
            { label: 'Electricidad', value: 'Electricidad' },
            { label: 'Carpintería', value: 'Carpintería' },
            { label: 'Albañilería', value: 'Albañilería' },
            { label: 'Refrigeración', value: 'Refrigeración' },
          ]}
        />
      </Flex>
      {technicians.length === 0 ? (
        <Empty description="Sin técnicos para los filtros seleccionados" />
      ) : (
        <Row gutter={[24, 24]}>
          {technicians.map((technician) => (
            <Col xs={24} md={12} key={technician._id}>
              <TechnicianCard technician={technician} />
            </Col>
          ))}
        </Row>
      )}
    </Flex>
  )
}

export default Technicians
