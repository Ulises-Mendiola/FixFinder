import PropTypes from 'prop-types'
import { Card, Flex, Rate, Tag, Typography, Avatar, Space } from 'antd'
import { ToolOutlined, EnvironmentOutlined } from '@ant-design/icons'
import resolveAvatarUrl from '../utils/avatar.js'

const { Paragraph, Text } = Typography

const TechnicianCard = ({ technician, actions }) => {
  const {
    profile,
    specialties,
    location,
    rating,
    bio,
    experienceYears,
    skills,
    avatar,
  } = technician

  return (
    <Card hoverable className="ff-surface" actions={actions ? [actions] : undefined}>
      <Flex align="center" gap={16}>
        <Avatar size={72} src={resolveAvatarUrl(avatar)}>
          {profile?.fullName?.slice(0, 1) ?? '?'}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Flex justify="space-between" align="flex-start">
            <div>
              <Typography.Title level={4} style={{ marginBottom: 4 }}>
                {profile?.fullName ?? 'Técnico FixFinder'}
              </Typography.Title>
              <Space size="small" wrap>
                {(specialties || []).map((specialty) => (
                  <Tag key={specialty} icon={<ToolOutlined />} color="blue">
                    {specialty}
                  </Tag>
                ))}
                <Tag icon={<EnvironmentOutlined />} color="volcano">
                  {location}
                </Tag>
              </Space>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Rate disabled value={rating.average} allowHalf />
              <Text type="secondary">
                ({rating.count} reseñas)
              </Text>
            </div>
          </Flex>
          <Paragraph type="secondary" style={{ marginTop: 12 }}>
            {bio}
          </Paragraph>
          <Flex gap={8} wrap="wrap" style={{ marginBottom: 12 }}>
            {skills.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </Flex>
          <Text strong>{experienceYears} años de experiencia</Text>
        </div>
      </Flex>
    </Card>
  )
}

TechnicianCard.propTypes = {
  technician: PropTypes.shape({
    profile: PropTypes.shape({
      fullName: PropTypes.string,
    }),
    specialties: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.string,
    rating: PropTypes.shape({
      average: PropTypes.number,
      count: PropTypes.number,
    }),
    bio: PropTypes.string,
    experienceYears: PropTypes.number,
    skills: PropTypes.arrayOf(PropTypes.string),
    avatar: PropTypes.string,
  }).isRequired,
  actions: PropTypes.node,
}

TechnicianCard.defaultProps = {
  actions: undefined,
}

export default TechnicianCard
