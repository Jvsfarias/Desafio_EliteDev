import bcrypt from 'bcryptjs'
import Event from '../models/Event.js'
import SeedFlag, { SEED_KEY } from '../models/SeedFlag.js'
import User from '../models/User.js'

const CINEMA_SEAT_MAP = { rows: 8, cols: 12 }

function getDefaultUsers() {
  return [
    {
      name: 'Organizador',
      email: process.env.SEED_ORGANIZADOR_EMAIL,
      password: process.env.SEED_ORGANIZADOR_PASSWORD,
      role: 'organizador',
    },
    {
      name: 'Portaria',
      email: process.env.SEED_PORTARIA_EMAIL,
      password: process.env.SEED_PORTARIA_PASSWORD,
      role: 'portaria',
    },
    {
      name: 'Ana Cliente',
      email: process.env.SEED_CLIENTE1_EMAIL,
      password: process.env.SEED_CLIENTE1_PASSWORD,
      role: 'cliente',
    },
    {
      name: 'Bruno Cliente',
      email: process.env.SEED_CLIENTE2_EMAIL,
      password: process.env.SEED_CLIENTE2_PASSWORD,
      role: 'cliente',
    },
  ]
}

async function seedUsers() {
  const created = []

  for (const user of getDefaultUsers()) {
    if (!user.email || !user.password) {
      console.warn(`Seed ignorado para role ${user.role}: variáveis de ambiente ausentes`)
      continue
    }

    const exists = await User.findOne({ email: user.email })

    if (exists) {
      created.push(exists)
      continue
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)
    const saved = await User.create({
      ...user,
      password: hashedPassword,
    })

    created.push(saved)
    console.log(`Usuário default criado: ${user.email} (${user.role})`)
  }

  return created
}

function getDefaultEvents(organizerId) {
  return [
    {
      catalogItemId: 'seed-filme',
      title: 'A Origem',
      type: 'filme',
      image: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      rating: '14',
      movieDetails: {
        tmdbId: 27205,
        originalTitle: 'Inception',
        overview:
          'Um ladrão que invade os sonhos é contratado para plantar uma ideia na mente de um herdeiro.',
        backdrop: 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
        releaseDate: '2010-07-16',
        voteAverage: 8.4,
        voteCount: 36000,
        popularity: 90,
        originalLanguage: 'en',
        genreIds: [28, 878, 12],
        genres: ['Ação', 'Ficção científica', 'Aventura'],
        adult: false,
      },
      venue: 'Sala 1 — Cinemark EliteDev',
      price: 28,
      seatMap: CINEMA_SEAT_MAP,
      sessions: [
        { date: '2026-09-18', times: ['14:30', '19:00'] },
        { date: '2026-09-19', times: ['16:00', '21:15'] },
      ],
      capacity: CINEMA_SEAT_MAP.rows * CINEMA_SEAT_MAP.cols,
      createdBy: organizerId,
    },
    {
      catalogItemId: 'seed-show',
      title: 'Festival EliteDev Live',
      type: 'show',
      image: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      description:
        'Show de abertura da temporada EliteDev, com palco principal, áreas VIP e pista.',
      venue: 'Allianz Parque — São Paulo',
      showDate: '2026-10-03',
      showTime: '21:00',
      areas: [
        { key: 'pista', label: 'Pista', capacity: 200, price: 80 },
        { key: 'pistaPremium', label: 'Pista Premium', capacity: 80, price: 140 },
        { key: 'cadeiraInferior', label: 'Cadeira Inferior', capacity: 120, price: 110 },
        { key: 'cadeiraSuperior', label: 'Cadeira Superior', capacity: 150, price: 70 },
        { key: 'lounge', label: 'Lounge Premium', capacity: 40, price: 220 },
        { key: 'vipA', label: 'VIP A', capacity: 20, price: 320 },
        { key: 'vipB', label: 'VIP B', capacity: 20, price: 280 },
      ],
      price: 0,
      capacity: 630,
      createdBy: organizerId,
    },
  ]
}

async function seedEvents(organizer) {
  if (!organizer) {
    console.warn('Seed de eventos ignorado: organizador não encontrado.')
    return
  }

  for (const event of getDefaultEvents(organizer._id)) {
    const exists = await Event.findOne({ catalogItemId: event.catalogItemId })
    if (exists) continue

    await Event.create(event)
    console.log(`Evento default criado: ${event.title} (${event.type})`)
  }
}

async function markSeedExecuted() {
  await SeedFlag.create({
    key: SEED_KEY,
    executedAt: new Date(),
  })
}

export async function seedDefaultUsers() {
  const alreadyRan = await SeedFlag.findOne({ key: SEED_KEY })

  if (alreadyRan) {
    console.log(`Seed já executada em ${alreadyRan.executedAt.toISOString()}.`)
    return
  }

  const users = await seedUsers()
  const organizer = users.find((user) => user.role === 'organizador')
  await seedEvents(organizer)
  await markSeedExecuted()
  console.log('Seed concluída e marcada como executada.')
}
