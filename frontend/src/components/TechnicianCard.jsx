import PropTypes from 'prop-types'
import { Card, Flex, Rate, Tag, Typography, Avatar, Space } from 'antd'
import { ToolOutlined, EnvironmentOutlined } from '@ant-design/icons'

const { Paragraph, Text } = Typography

const TechnicianCard = ({ technician }) => (
  <Card hoverable>
    <Flex align="center" gap={16}>
      <Avatar size={72} src={technician.avatar}>
        {technician.profile.fullName.slice(0, 1)}
      </Avatar>
      <div style={{ flex: 1 }}>
        <Flex justify="space-between" align="flex-start">
          <div>
            <Typography.Title level={4} style={{ marginBottom: 4 }}>
              {technician.profile.fullName}
            </Typography.Title>
            <Space size="small">
              <Tag icon={<ToolOutlined />} color="blue">{technician.specialty}</Tag>
              <Tag icon={<EnvironmentOutlined />} color="volcano">{technician.location}</Tag>
            </Space>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Rate disabled value={technician.rating.average} allowHalf />
            <Text type="secondary">({technician.rating.count} reseñas)</Text>
          </div>
        </Flex>
        <Paragraph type="secondary" style={{ marginTop: 12 }}>
          {technician.bio}
        </Paragraph>
        <Flex gap={8} wrap="wrap">
          {technician.skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </Flex>
        <Text strong>{technician.experienceYears} años de experiencia</Text>
      </div>
    </Flex>
  </Card>
)

TechnicianCard.propTypes = {
  technician: PropTypes.shape({
    profile: PropTypes.shape({
      fullName: PropTypes.string.isRequired,
    }).isRequired,
    specialty: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    rating: PropTypes.shape({
      average: PropTypes.number.isRequired,
      count: PropTypes.number.isRequired,
    }).isRequired,
    bio: PropTypes.string.isRequired,
    experienceYears: PropTypes.number.isRequired,
    skills: PropTypes.arrayOf(PropTypes.string).isRequired,
    avatar: PropTypes.string,
  }).isRequired,
}

export default TechnicianCard
