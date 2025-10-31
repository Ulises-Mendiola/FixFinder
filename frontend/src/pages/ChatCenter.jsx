import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Card,
  Flex,
  Typography,
  Button,
  List,
  Input,
  Empty,
  Spin,
  Tag,
  Space,
  message,
} from 'antd'
import { ReloadOutlined, SendOutlined, MessageOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api.js'
import useAuth from '../hooks/useAuth.js'

const { Title, Text, Paragraph } = Typography

const STATUS_COLORS = {
  pending: 'gold',
  accepted: 'blue',
  in_progress: 'green',
  completed: 'gray',
  cancelled: 'red',
}

const ChatCenter = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [loadingThread, setLoadingThread] = useState(false)
  const [searchParams] = useSearchParams()
  const conversationQuery = searchParams.get('conversation')
  const threadRef = useRef(null)

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true)
    try {
      const { data } = await api.get('/conversations')
      setConversations(data.conversations ?? [])
    } catch (error) {
      console.error('list conversations error', error)
      message.error('No se pudieron cargar tus chats.')
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  const openConversation = useCallback(async (conversationId) => {
    if (!conversationId) return
    setSelectedConversationId(conversationId)
    setLoadingThread(true)
    try {
      const { data } = await api.get(`/conversations/${conversationId}`)
      setSelectedConversation(data.conversation)
      setMessages(data.conversation?.messages ?? [])
    } catch (error) {
      console.error('get conversation error', error)
      message.error('No se pudo cargar el chat seleccionado.')
    } finally {
      setLoadingThread(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    const fallbackId = conversationQuery || conversations[0]?._id
    if (fallbackId && fallbackId !== selectedConversationId) {
      openConversation(fallbackId)
    }
  }, [conversationQuery, conversations, openConversation, selectedConversationId])

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    const trimmed = messageInput.trim()
    if (!trimmed || !selectedConversationId) {
      return
    }
    setSendingMessage(true)
    try {
      const { data } = await api.post(`/conversations/${selectedConversationId}/messages`, { body: trimmed })
      const newMessage = data.message
      setMessages((prev) => [...prev, newMessage])
      setSelectedConversation((prev) => (prev
        ? { ...prev, messages: [...(prev.messages ?? []), newMessage] }
        : prev))
      setMessageInput('')
      setConversations((prev) => prev
        .map((conversation) => (
          conversation._id === selectedConversationId
            ? { ...conversation, updatedAt: new Date().toISOString() }
            : conversation
        ))
        .sort((a, b) => new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0)))
      fetchConversations()
    } catch (error) {
      console.error('send chat message error', error)
      message.error('No se pudo enviar el mensaje.')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleRefresh = () => {
    fetchConversations()
    if (selectedConversationId) {
      openConversation(selectedConversationId)
    }
  }

  const peerName = useMemo(() => {
    if (!selectedConversation) return ''
    const participant = (selectedConversation.participants ?? []).find((participantItem) => (
      String(participantItem._id) !== String(user?._id)
    ))
    return participant?.profile?.fullName ?? 'Contacto FixFinder'
  }, [selectedConversation, user?._id])

  const statusTag = useMemo(() => {
    const status = selectedConversation?.serviceRequest?.status
    if (!status) return null
    return (
      <Tag color={STATUS_COLORS[status] ?? 'default'}>
        {status.replace(/_/g, ' ')}
      </Tag>
    )
  }, [selectedConversation?.serviceRequest?.status])

  const expirationLabel = selectedConversation?.expiresAt
    ? new Date(selectedConversation.expiresAt).toLocaleDateString('es-MX')
    : null

  const isSendDisabled = !messageInput.trim() || sendingMessage || !selectedConversationId

  return (
    <Card className="ff-surface">
      <Flex gap={24} align="stretch" wrap="wrap">
        <div style={{ flex: '0 0 320px', maxWidth: 360, width: '100%' }}>
          <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
            <Flex align="center" gap={8}>
              <MessageOutlined style={{ color: 'var(--ff-accent)' }} />
              <Title level={4} style={{ margin: 0 }}>Mis chats</Title>
            </Flex>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} />
          </Flex>
          {loadingConversations ? (
            <Flex justify="center" style={{ padding: 32 }}>
              <Spin />
            </Flex>
          ) : conversations.length === 0 ? (
            <Empty description="Sin chats activos" />
          ) : (
            <List
              dataSource={conversations}
              renderItem={(item) => {
                const peer = (item.participants ?? []).find((participantItem) => (
                  String(participantItem._id) !== String(user?._id)
                ))
                const isActive = item._id === selectedConversationId
                const lastUpdated = item.updatedAt
                  ? new Date(item.updatedAt).toLocaleString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })
                  : ''
                return (
                  <List.Item
                    onClick={() => openConversation(item._id)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 12,
                      padding: '12px 16px',
                      border: isActive ? '1px solid var(--ff-accent)' : '1px solid transparent',
                      backgroundColor: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                      marginBottom: 8,
                    }}
                  >
                    <Flex vertical gap={4}>
                      <Text strong>{peer?.profile?.fullName ?? 'Contacto FixFinder'}</Text>
                      <Text type="secondary">
                        {item.serviceRequest?.title ?? 'Solicitud sin titulo'}
                      </Text>
                      <Space size={8}>
                        {item.serviceRequest?.status && (
                          <Tag color={STATUS_COLORS[item.serviceRequest.status] ?? 'default'}>
                            {item.serviceRequest.status.replace(/_/g, ' ')}
                          </Tag>
                        )}
                        {lastUpdated && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Actualizado {lastUpdated}
                          </Text>
                        )}
                      </Space>
                    </Flex>
                  </List.Item>
                )
              }}
            />
          )}
        </div>
        <div style={{ flex: '1 1 420px', minWidth: 320 }}>
          {!selectedConversation ? (
            <Flex align="center" justify="center" style={{ minHeight: 360 }}>
              {loadingThread ? <Spin /> : <Empty description="Selecciona un chat para comenzar" />}
            </Flex>
          ) : (
            <Flex vertical gap={16} style={{ minHeight: 360 }}>
              <Flex align="center" justify="space-between">
                <div>
                  <Title level={4} style={{ marginBottom: 4 }}>{peerName}</Title>
                  <Text type="secondary">
                    {selectedConversation.serviceRequest?.title ?? 'Solicitud sin titulo'}
                  </Text>
                </div>
                <Space size={8}>
                  {statusTag}
                  {expirationLabel && (
                    <Tag color="gold">Eliminacion: {expirationLabel}</Tag>
                  )}
                </Space>
              </Flex>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Los mensajes se conservan mientras la reparacion este activa y se eliminan de forma automatica una semana despues de finalizarla.
              </Paragraph>
              <div
                ref={threadRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  maxHeight: 420,
                  padding: '16px 12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                }}
              >
                {loadingThread ? (
                  <Flex justify="center" style={{ padding: 32 }}>
                    <Spin />
                  </Flex>
                ) : messages.length === 0 ? (
                  <Flex justify="center" style={{ padding: 32 }}>
                    <Empty description="Aun no hay mensajes" />
                  </Flex>
                ) : (
                  messages.map((chatMessage, index) => {
                    const senderId = chatMessage.sender?._id ?? chatMessage.sender
                    const isOwn = String(senderId) === String(user?._id)
                    const bubbleStyle = {
                      maxWidth: '70%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      backgroundColor: isOwn ? 'var(--ff-accent)' : '#fff',
                      color: isOwn ? '#fff' : '#1e293b',
                      boxShadow: '0 1px 4px rgba(15,23,42,0.08)',
                    }
                    const timestamp = chatMessage.createdAt
                      ? new Date(chatMessage.createdAt).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : ''
                    return (
                      <Flex
                        key={`${chatMessage.createdAt ?? index}-${index}`}
                        justify={isOwn ? 'flex-end' : 'flex-start'}
                        style={{ marginBottom: 12 }}
                      >
                        <Flex vertical gap={4} align={isOwn ? 'flex-end' : 'flex-start'}>
                          <div style={bubbleStyle}>
                            <Text strong>
                              {isOwn ? 'Tu' : chatMessage.sender?.profile?.fullName ?? 'Contacto'}
                            </Text>
                            <Paragraph style={{ margin: '4px 0 0' }}>
                              {chatMessage.body}
                            </Paragraph>
                          </div>
                          {timestamp && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {timestamp}
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    )
                  })
                )}
              </div>
              <Flex gap={12} align="flex-end">
                <Input.TextArea
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  value={messageInput}
                  disabled={!selectedConversationId}
                  onChange={(event) => setMessageInput(event.target.value)}
                  onPressEnter={(event) => {
                    if (!event.shiftKey) {
                      event.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Escribe un mensaje"
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={isSendDisabled}
                  loading={sendingMessage}
                />
              </Flex>
            </Flex>
          )}
        </div>
      </Flex>
    </Card>
  )
}

export default ChatCenter
