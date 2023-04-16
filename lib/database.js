import { initializeApp } from 'firebase/app'
import { get, getDatabase, increment, ref, remove, set } from 'firebase/database'
import { isNull } from 'util'

const config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: 'https://community-ranking-d7bf5-default-rtdb.firebaseio.com',
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
}

initializeApp(config)

const db = getDatabase()

export const writeTeamsData = (teamName, spot) => {
  set(ref(db, `teams/${teamName}`), {
    sumOfSpots: increment(spot)
  })
}

export const writePlayersData = (playerName, spot) => {
  set(ref(db, `players/${playerName}`), {
    sumOfSpots: increment(spot)
  })
}

export const writeIP = ip => {
  const date = new Date()

  set(ref(db, `cooldownIPs/${ip}`), {
    ip: ip,
    addedAt: date.getTime()
  })
}

export const retrieveTeamData = async teamName => {
  const snapshot = await get(ref(db, `teams/${teamName}`))
  return snapshot.val()
}

export const retrievePlayerData = async playerName => {
  const snapshot = await get(ref(db, `players/${playerName}`))
  return snapshot.val()
}

export const retrieveIP = async ip => {
  const snapshot = await get(ref(db, `cooldownIPs/${ip}`))
  return snapshot.val()
}

export const retrieveAllIPs = async () => {
  const snapshot = await get(ref(db, 'cooldownIPs'))
  return snapshot.val()
}

export const isIPExistent = async ip => {
  return !isNull(retrieveIP(ip))
}

export const removeIP = async ip => {
  remove(ref(db, `cooldownIPs/${ip}`))
}
