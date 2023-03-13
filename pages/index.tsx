import Head from 'next/head'
import { VStack, Text, Image, HStack, Center, Box, Input, Hide, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ListItem, OrderedList, Tabs, TabList, TabPanels, Tab, TabPanel, Kbd, Show, Popover, PopoverTrigger, PopoverContent, Button, useDisclosure, useToast, ModalFooter, Checkbox, CheckboxGroup,  } from '@chakra-ui/react'
import { InfoIcon, QuestionIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import Teams from '../lib/teams.json'
import Players from '../lib/players.json'
import { initializeApp } from 'firebase/app'
import { get, getDatabase, increment, push, ref, remove, set } from 'firebase/database'
import { useState } from 'react'
import create from 'zustand'
import { persist } from 'zustand/middleware'
import { isNull } from 'util'
import { ReactSortable } from 'react-sortablejs'

const ELAPSED_TO_WAIT = 2400000

let useTabIndex = set => ({
  number: 0,
  changeTabIndex: index => set(state => ({
    number: index
  }))
})

useTabIndex = persist(useTabIndex, { name: 'communityRankingTab' })
useTabIndex = create(useTabIndex)

type Team = {
  name: string,
  logo: string
}

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

const writeTeamsData = (teamName: string, spot: number) => {
  set(ref(db, `teams/${teamName}`), {
    sumOfSpots: increment(spot)
  })
}

const writePlayersData = (playerName: string, spot: number) => {
  set(ref(db, `players/${playerName}`), {
    sumOfSpots: increment(spot)
  })
}

const writeIP = (ip: string) => {
  const date = new Date()

  set(ref(db, `cooldownIPs/${ip}`), {
    ip: ip,
    addedAt: date.getTime()
  })
}

const retrieveTeamData = async (teamName: string) => {
  const snapshot = await get(ref(db, `teams/${teamName}`))
  return snapshot.val()
}

const retrievePlayerData = async (playerName: string) => {
  const snapshot = await get(ref(db, `players/${playerName}`))
  return snapshot.val()
}

const retrieveIP = async (ip: string) => {
  const snapshot = await get(ref(db, `cooldownIPs/${ip}`))
  return snapshot.val()
}

const retrieveAllIPs = async () => {
  const snapshot = await get(ref(db, 'cooldownIPs'))
  return snapshot.val()
}


const Info = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Info</ModalHeader>
          <ModalBody pb="2rem">
            <Center>
              <Text fontSize="1.5rem" textAlign="center" color="teal.200">Vote for the spots of teams and players!</Text>
            </Center>
            <OrderedList mt="1rem" textAlign="center" fontSize="1.3rem">
              <ListItem>You have 30 spots in total.</ListItem>
              <ListItem>The teams/players are sorted by the arithmetic mean.</ListItem>
              <ListItem>The page reloads once you have voted.</ListItem>
            </OrderedList>
          </ModalBody>
          <ModalCloseButton />
        </ModalContent>
      </Modal>

      <IconButton
        zIndex="999"
        position="fixed"
        top="8"
        left="1"
        variant="ghost"
        rounded="full"
        boxSize="3.5rem"
        icon={<InfoIcon boxSize="30" />}
        onClick={onOpen}
      />
    </>
  )
}

const Guide = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Info</ModalHeader>
          <ModalBody pb="2rem">
            <OrderedList spacing="0.5rem" textAlign="center" fontSize="1.3rem" textAlign="left">
              <ListItem>
                <Kbd><TriangleUpIcon /></Kbd> increments the team spot, whereas <Kbd><TriangleDownIcon /></Kbd> decrements it.
              </ListItem>
              <ListItem>
                Press
                <Button width="3.5rem" height="2rem" ml="10px" variant="outline" colorScheme="teal">Vote</Button> and
                confirm your action in the alert dialogue.
              </ListItem>
              <ListItem>
                Continue voting or refresh the page for the spots to be updated.
              </ListItem>
            </OrderedList>
          </ModalBody>
          <ModalCloseButton />
        </ModalContent>
      </Modal>

      <IconButton
        zIndex="999"
        position="fixed"
        top="8"
        left="1"
        variant="ghost"
        rounded="full"
        boxSize="3.5rem"
        icon={<QuestionIcon boxSize="30" />}
        onClick={onOpen}
      />
    </>
  )
}

const getList = (dictionary: any) => {
  let ret = []
  for (let element of dictionary) {
    ret.push(element.name)
  }

  return ret
}

const Home = ({ teamsData, playersData, ipToUse, ip, allIPs }) => {
  ip = ip || { ip: ipToUse, addedAt: ELAPSED_TO_WAIT }
  const date = new Date()
  const time = date.getTime()

  const elapsed = time - ip.addedAt

  const toast = useToast()
  const [searchTeam, setSearchTeam] = useState('')
  const [searchPlayerName, setSearchPlayerName] = useState('')

  const handleTeamNameChange = event => setSearchTeam(event.target.value)
  const handlePlayerNameChange = event => setSearchPlayerName(event.target.value)

  Teams.sort((a: Team, b: Team) => {
    const getSpotA = teamsData[a.name].sumOfSpots
    const getSpotB = teamsData[b.name].sumOfSpots

    if (getSpotA > getSpotB) {
      return 1
    } else if (getSpotA < getSpotB) {
      return -1
    } else {
      return 0
    }
  })

  let teamSpots = []
  Teams.map(key => {
    teamSpots.push(key.name)
  })

  Players.sort((a: Team, b: Team) => {
    const getSpotA = playersData[a.name].sumOfSpots
    const getSpotB = playersData[b.name].sumOfSpots

    if (getSpotA > getSpotB) {
      return 1
    } else if (getSpotA < getSpotB) {
      return -1
    } else {
      return 0
    }
  })

  let playerSpots = []
  Players.map(key => {
    playerSpots.push(key.name)
  })

  const changeTabIndex = useTabIndex(state => state.changeTabIndex)
  const tabIndex = useTabIndex(state => state.number)
  
  const handleTabsChange = index => {
    changeTabIndex(index)
  }

  const [teamsList, setTeamsList] = useState(Teams)
  const [playersList, setPlayersList] = useState(Players)
  
  const [hasVoted, setHasVoted] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [voteForTeams, setVoteForTeams] = useState(false)
  const [voteForPlayers, setVoteForPlayers] = useState(false)

  return (
    <>
      <Head>
        <title>Counter-Strike Community Ranking</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HStack spacing="3rem">
        <Info />
        <Guide />       
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay
          bg="none"
          backdropFilter="auto"
          backdropInvert="80%"
          backdropBlur="2px"
        />
        <ModalContent width="15rem">
          <ModalBody pt="1.5rem">
            <VStack alignItems="left">
              <Checkbox defaultChecked={false} onChange={e => setVoteForTeams(e.target.checked)}>Teams</Checkbox>
              <Checkbox defaultChecked={false} onChange={e => setVoteForPlayers(e.target.checked)}>Players</Checkbox>
            </VStack>
          </ModalBody>

          <ModalFooter justifyContent="center">
            <Button colorScheme="blue" onClick={() => {
              if ((voteForTeams === false) && (voteForPlayers === false)) {
                toast({
                  title: 'Error',
                  description: "Neither teams' nor players' checkbox has been selected.",
                  status: 'error'
                })
                return
              }

              if (voteForTeams) {
                const newTeamsList = getList(teamsList)
                for (let i = 1; i <= 30; i++) {
                  const element = newTeamsList[i - 1]
                  writeTeamsData(element, i)
                }
              }
              
              if (voteForPlayers) {
                const newPlayersList = getList(playersList)
                for (let i = 1; i <= 30; i++) {
                  const element = newPlayersList[i - 1]
                  writePlayersData(element, i)
                }
              }

              writeIP(ip.ip)
              setHasVoted(true)
              toast({
                title: 'Success',
                description: 'Your vote has been included. The page is to update.',
                status: 'success'
              })

              onClose()
              setTimeout(() => window.location.reload(), 1000)
            }}>
              Vote
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {(elapsed <= ELAPSED_TO_WAIT) && (
        <Box zIndex="1" py="0.08rem" width="full" backgroundColor="yellow.500" position="sticky" top="0" textAlign="center">Temporary cooldown for 40 minutes</Box>
      )}

      <Text fontSize="3.5rem" textAlign="center" mt="1rem" bgClip="text" fill="transparent" bgColor="#da99ff" bgGradient="radial-gradient(at 87% 44%, hsla(223,70%,78%,1) 0px, transparent 50%), radial-gradient(at 76% 71%, hsla(260,97%,61%,1) 0px, transparent 50%), radial-gradient(at 90% 10%, hsla(338,78%,60%,1) 0px, transparent 50%), radial-gradient(at 32% 68%, hsla(357,99%,79%,1) 0px, transparent 50%), radial-gradient(at 62% 29%, hsla(284,73%,79%,1) 0px, transparent 50%), radial-gradient(at 35% 23%, hsla(195,91%,76%,1) 0px, transparent 50%), radial-gradient(at 71% 80%, hsla(315,99%,69%,1) 0px, transparent 50%);" >The Community Ranking</Text>

      <Center mt="1rem"><Box p="0.7rem" borderRadius="9999px" bgGradient="radial-gradient(at 87% 44%, hsla(223,70%,78%,1) 0px, transparent 50%), radial-gradient(at 76% 71%, hsla(260,97%,61%,1) 0px, transparent 50%), radial-gradient(at 90% 10%, hsla(338,78%,60%,1) 0px, transparent 50%), radial-gradient(at 32% 68%, hsla(357,99%,79%,1) 0px, transparent 50%), radial-gradient(at 62% 29%, hsla(284,73%,79%,1) 0px, transparent 50%), radial-gradient(at 35% 23%, hsla(195,91%,76%,1) 0px, transparent 50%), radial-gradient(at 71% 80%, hsla(315,99%,69%,1) 0px, transparent 50%);"><span style={{ color: '#000', borderRadius: '9999px', fontSize: '1.5rem' }}>Vote responsibly</span></Box></Center>

      {(hasVoted || (elapsed >= ELAPSED_TO_WAIT)) && (
        <Button onClick={onOpen} zIndex="2" position="fixed" bottom="5" right="5">Apply spots</Button>
      )}

      <Tabs isLazy defaultIndex={tabIndex} onChange={handleTabsChange} variant="soft-rounded">
        <Center>
          <TabList mt="2rem">
            <Tab>Teams</Tab>
            <Tab>Players</Tab>
          </TabList>
        </Center>
        <TabPanels>
          <TabPanel>
            <Center>
              <VStack spacing="2rem" id="teamsList">
                <Input mt="0.5rem" width="15rem" placeholder="Enter the team name" value={searchTeam} onChange={handleTeamNameChange} />
                <ReactSortable
                  id="a"
                  filter=".addImageButtonContainer"
                  dragClass="sortableDrag"
                  list={teamsList}
                  setList={setTeamsList}
                  animation={200}
                >
                  {Object.keys(teamsList).map((key: string) => {
                    return (
                      <HStack display={Teams[key].name.toLowerCase().includes(searchTeam.toLowerCase()) ? 'flex' : 'none'} justifyContent={{ base: 'center', '474px': 'left' }} backgroundColor="#111827" height="6rem" width={{ base: '7rem', '474px': '22rem', '1100px': '23rem' }} rounded="lg" borderWidth="2px" borderColor="#374151">
                        <HStack>
                          <HStack px="1rem">
                            <Text>#{(teamSpots.indexOf(Teams[key].name)+1).toLocaleString('en-gb', { minimumIntegerDigits: 2, useGrouping:false })}</Text>
                            <Show breakpoint="(min-width: 474px)">
                              <Image
                                src={teamsList[key].logo}
                                draggable={false}
                                width="2.5rem"
                                height="auto"
                              />
                            </Show>
                            <Hide breakpoint="(min-width: 474px)">
                              <Popover>
                                <PopoverTrigger>
                                  <Button variant="link">
                                    <Image
                                      src={teamsList[key].logo}
                                      draggable={false}
                                      width={{ base: '2.5rem', '1100px': '2.7rem' }}
                                      height="auto"
                                    />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent width="fit-content" p="0.5rem" backgroundColor="#cbd5e0">
                                  <Text color="#171923">{teamsList[key].name}</Text>
                                </PopoverContent>
                              </Popover>
                            </Hide>

                            <Hide breakpoint="(max-width: 474px)">
                              <VStack spacing="0" alignItems="left">
                                <Text id={`${teamsList[key].name}-team-name`} color="#fff" fontWeight="600" fontSize={{ base: '0.9rem', '1100px': '1rem' }}>{teamsList[key].name}</Text>
                                <HStack>
                                  {Array.from(teamsList[key].players.sort()).map(player => {
                                    return (
                                      <Text fontSize="0.7rem">{player}</Text>
                                    )
                                  })}
                                </HStack>
                              </VStack>
                            </Hide>
                          </HStack>
                        </HStack>
                      </HStack>
                    )
                  })}
                </ReactSortable>
              </VStack>
            </Center>
          </TabPanel>
          <TabPanel>
            <Center>
              <VStack spacing="2rem" id="playersList">
                <Input mt="0.5rem" width="15rem" placeholder="Enter the player name" value={searchPlayerName} onChange={handlePlayerNameChange} />
                <ReactSortable
                  filter=".addImageButtonContainer"
                  dragClass="sortableDrag"
                  list={playersList}
                  setList={setPlayersList}
                  animation={200}
                >
                  {Object.keys(playersList).map((key: string) => {
                      return (
                      <HStack display={Players[key].name.toLowerCase().includes(searchPlayerName.toLowerCase()) ? 'flex' : 'none'} justifyContent={{ base: 'center', '474px': 'left' }} backgroundColor="#111827" height="6rem" width={{ base: '7rem', '474px': '12rem' }} rounded="lg" borderWidth="2px" borderColor="#374151">
                        <HStack>
                          <HStack px="1rem" spacing="0.7rem">
                            <Text>#{(playerSpots.indexOf(Players[key].name)+1).toLocaleString('en-gb', { minimumIntegerDigits: 2, useGrouping:false })}</Text>
                            <Show breakpoint="(min-width: 474px)">
                              <Image
                                src={playersList[key].logo}
                                draggable={false}
                                width="2.5rem"
                                height="auto"
                                />
                            </Show>
                            <Hide breakpoint="(min-width: 474px)">
                              <Popover>
                                <PopoverTrigger>
                                  <Button variant="link">
                                    <Image
                                      src={playersList[key].logo}
                                      draggable={false}
                                      width={{ base: '2.5rem', '1100px': '2.7rem' }}
                                      height="auto"
                                      />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent width="fit-content" p="0.5rem" backgroundColor="#cbd5e0">
                                  <Text color="#171923">{playersList[key].name}</Text>
                                </PopoverContent>
                              </Popover>
                            </Hide>
                            <Hide breakpoint="(max-width: 474px)">
                              <Text id={`${playersList[key].name}-team-name`} color="#fff" fontWeight="600" fontSize={{ base: '0.9rem', '1100px': '0.85rem' }}>{playersList[key].name}</Text>
                            </Hide>
                          </HStack>
                        </HStack>
                      </HStack>
                    )
                  }
                  )}
                </ReactSortable>
              </VStack>
            </Center>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}


export async function getServerSideProps({ req }) {
  let teamsData = {}
  let playersData = {}

  await Promise.all(Teams.map(async team => {
    return retrieveTeamData(team.name).then(snapshot => {
      teamsData[team.name] = snapshot
    })
  }))

  await Promise.all(Players.map(async player => {
    return retrievePlayerData(player.name).then(snapshot => {
      playersData[player.name] = snapshot
    })
  }))

  const forwarded = req.headers['x-forwarded-for']

  const ipToUse = typeof forwarded === 'string' ? forwarded.split(/, /)[0] : req.socket.remoteAddress
  
  let ip;
  await retrieveIP(ipToUse).then(async snapshot => {
    ip = snapshot
  })

  let allIPs;
  await retrieveAllIPs().then(async snapshot => {
    allIPs = snapshot
  })

  const date = new Date()
  const time = date.getTime()

  if (!isNull(allIPs)) {
    Object.keys(allIPs).map(key => {
      const elapsed = time - allIPs[key].addedAt
      if (elapsed >= ELAPSED_TO_WAIT) {
        remove(ref(db, `cooldownIPs/${key}`))
      }
    })
  }

  return { props: { teamsData, playersData, ipToUse, ip, allIPs } }
}

export default Home
