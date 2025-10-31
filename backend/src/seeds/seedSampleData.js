/* eslint-disable no-console */
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const connectDB = require('../config/db')
const User = require('../models/User')

dotenv.config()

const clients = [
  { fullName: 'Ana Rodríguez', email: 'ana.rodriguez@example.com', phone: '5511002201', label: 'Casa', city: 'CDMX', state: 'CDMX', street: 'Roma Norte', zipCode: '06700' },
  { fullName: 'Luis Hernández', email: 'luis.hernandez@example.com', phone: '5511002202', label: 'Departamento', city: 'Guadalajara', state: 'Jalisco', street: 'Providencia', zipCode: '44630' },
  { fullName: 'María Fernanda Díaz', email: 'maria.diaz@example.com', phone: '5511002203', label: 'Casa', city: 'Monterrey', state: 'Nuevo León', street: 'San Pedro', zipCode: '66220' },
  { fullName: 'José Antonio Flores', email: 'jose.flores@example.com', phone: '5511002204', label: 'Oficina', city: 'Querétaro', state: 'Querétaro', street: 'Centro', zipCode: '76000' },
  { fullName: 'Paola González', email: 'paola.gonzalez@example.com', phone: '5511002205', label: 'Residencia', city: 'Puebla', state: 'Puebla', street: 'Angelópolis', zipCode: '72830' },
  { fullName: 'Ricardo Vega', email: 'ricardo.vega@example.com', phone: '5511002206', label: 'Casa', city: 'Toluca', state: 'Edomex', street: 'Centro', zipCode: '50000' },
  { fullName: 'Daniela Chávez', email: 'daniela.chavez@example.com', phone: '5511002207', label: 'Departamento', city: 'CDMX', state: 'CDMX', street: 'Coyoacán', zipCode: '04000' },
  { fullName: 'Héctor García', email: 'hector.garcia@example.com', phone: '5511002208', label: 'Departamento', city: 'Monterrey', state: 'Nuevo León', street: 'Valle Oriente', zipCode: '66265' },
  { fullName: 'Vanessa López', email: 'vanessa.lopez@example.com', phone: '5511002209', label: 'Casa', city: 'Guadalajara', state: 'Jalisco', street: 'Chapalita', zipCode: '45040' },
  { fullName: 'Sergio Morales', email: 'sergio.morales@example.com', phone: '5511002210', label: 'Casa', city: 'Mérida', state: 'Yucatán', street: 'Centro', zipCode: '97000' },
]

const technicianSpecialties = [
  { specialties: ['Plomería'], skills: ['Reparación de fugas', 'Instalaciones hidráulicas', 'Calentadores'] },
  { specialties: ['Electricidad'], skills: ['Cableado residencial', 'Paneles eléctricos', 'Instalación de luminarias'] },
  { specialties: ['Carpintería'], skills: ['Muebles a medida', 'Restauración', 'Instalación de puertas'] },
  { specialties: ['Albañilería'], skills: ['Colocación de pisos', 'Tablaroca', 'Remodelación'] },
  { specialties: ['Refrigeración'], skills: ['Mantenimiento HVAC', 'Instalación de minisplit', 'Diagnóstico de equipos'] },
  { specialties: ['Pintura'], skills: ['Acabados interiores', 'Impermeabilización', 'Diseño decorativo'] },
  { specialties: ['Herrería'], skills: ['Portones', 'Protecciones', 'Soldadura'] },
  { specialties: ['Jardinería'], skills: ['Paisajismo', 'Sistemas de riego', 'Mantenimiento de áreas verdes'] },
]

const technicianNames = [
  'Carlos Mendoza',
  'Iván Suárez',
  'Diego Castro',
  'Miguel Ángel Torres',
  'Fernando Luna',
  'Javier Pérez',
  'Roberto Ruiz',
  'Alejandro Ortega',
  'Edgar Bautista',
  'Óscar Navarro',
  'Leonardo Ramírez',
  'Rubén Aguilar',
  'Marco Polo Ríos',
  'Gustavo Ortiz',
  'Rafael Campos',
  'Hugo Pineda',
  'Arturo Zamora',
  'Mauricio Lozano',
  'Emilio Carranza',
  'Raúl Serrano',
]

const cities = [
  'CDMX',
  'Guadalajara',
  'Monterrey',
  'Querétaro',
  'Puebla',
  'Toluca',
  'Mérida',
  'Tijuana',
  'Cancún',
  'León',
]

const randomFrom = (array) => array[Math.floor(Math.random() * array.length)]

const buildTechnician = (name, index) => {
  const base = technicianSpecialties[index % technicianSpecialties.length]
  const email = `${name.toLowerCase().replace(/[^a-z]/g, '.')}.${index + 1}@example.com`
  return {
    email,
    password: 'FixFinder123*',
    role: 'technician',
    profile: {
      fullName: name,
      phone: `5588${(100000 + index * 37).toString().slice(0, 4)}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    },
    technicianProfile: {
      specialties: base.specialties,
      experienceYears: 3 + (index % 12),
      bio: `Profesional certificado en ${base.specialties.join(', ').toLowerCase()} con más de ${3 + (index % 12)} años de experiencia.`,
      skills: base.skills,
      serviceAreas: [randomFrom(cities), randomFrom(cities)],
      rating: {
        average: 4 + (index % 10) / 10,
        count: 20 + (index * 3),
      },
      availability: [
        { day: 'Lunes', startHour: '09:00', endHour: '18:00' },
        { day: 'Miércoles', startHour: '09:00', endHour: '18:00' },
        { day: 'Sábado', startHour: '10:00', endHour: '15:00' },
      ],
      portfolio: [
        {
          title: `Proyecto destacado ${index + 1}`,
          description: `Trabajo reciente en ${base.specialties[0].toLowerCase()} con alta satisfacción del cliente.`,
          imageUrl: 'https://via.placeholder.com/320x200?text=Proyecto+FixFinder',
        },
      ],
    },
  }
}

const buildClient = (client, index) => ({
  email: client.email,
  password: 'FixFinder123*',
  role: 'client',
  profile: {
    fullName: client.fullName,
    phone: client.phone,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.fullName)}`,
  },
  clientProfile: {
    addresses: [{
      label: client.label,
      street: client.street,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
      country: 'México',
    }],
    favorites: [],
    reputation: {
      average: 4 + (index % 5) * 0.2,
      count: 3 + index,
    },
  },
  serviceHistory: [],
})

const hashUsers = async (users) => Promise.all(users.map(async (user) => ({
  ...user,
  password: await bcrypt.hash(user.password, 10),
})))

const seed = async () => {
  await connectDB()

  const existingCount = await User.countDocuments()
  if (existingCount > 0) {
    console.log('⚠️  Ya existen usuarios en la base. Cancela el seed para evitar duplicados.')
    await mongoose.disconnect()
    process.exit(0)
  }

  const clientDocs = await hashUsers(clients.map(buildClient))
  const technicianDocs = await hashUsers(technicianNames.map((name, index) => buildTechnician(name, index)))

  console.log('⏳ Insertando clientes de ejemplo...')
  await User.insertMany(clientDocs, { ordered: true })

  console.log('⏳ Insertando técnicos de ejemplo...')
  await User.insertMany(technicianDocs, { ordered: true })

  console.log('✅ Seed completado. Se crearon 10 clientes y 20 técnicos.')
  await mongoose.disconnect()
}

seed().catch(async (error) => {
  console.error('❌ Error durante el seed:', error)
  await mongoose.disconnect()
  process.exit(1)
})
