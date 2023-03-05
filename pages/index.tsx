import Head from 'next/head'
import { AlertDialog, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, VStack, Text, Image, HStack, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Button, AlertDialogBody, AlertDialogCloseButton, Center, DarkMode, Box, Input, Hide, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ListItem, OrderedList, Tabs, TabList, TabPanels, Tab, TabPanel, useDisclosure, useToast, Kbd, Show, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverArrow, PopoverCloseButton, PopoverBody, PopoverFooter, Tooltip } from '@chakra-ui/react'
import { InfoIcon, QuestionIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import Teams from '../lib/teams.json'
import Players from '../lib/players.json'
import { initializeApp } from 'firebase/app'
import { get, getDatabase, increment, ref, set } from 'firebase/database'
import { useState, useEffect } from 'react'
import create from 'zustand'
import { persist } from 'zustand/middleware'
import { ReactSortable } from 'react-sortablejs'

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
  apiKey: "AIzaSyAhueS1EcupzIUmTA7nhm7bwF48qDN8zbc",
  authDomain: "community-ranking-d7bf5.firebaseapp.com",
  databaseURL: "https://community-ranking-d7bf5-default-rtdb.firebaseio.com",
  projectId: "community-ranking-d7bf5",
  storageBucket: "community-ranking-d7bf5.appspot.com",
  messagingSenderId: "494668400916",
  appId: "1:494668400916:web:5cfb82bcd3b57f12ec9a01",
  measurementId: "G-EWZZ6L87ZR"
}

initializeApp(config)

const db = getDatabase()

const writeTeamData = (teamName: string, spot: number) => {
  set(ref(db, `teams/${teamName}`), {
    numberOfVotes: increment(1),
    sumOfVotes: increment(spot)
  })
}

const writePlayerData = (playerName: string, spot: number) => {
  set(ref(db, `players/${playerName}`), {
    numberOfVotes: increment(1),
    sumOfVotes: increment(spot)
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


const getSpot = (sumOfVotes: number, numberOfVotes: number) => {
  const predefined = sumOfVotes / numberOfVotes
  return isNaN(predefined) ? 0: predefined
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
        top="1"
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
        top="1"
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

const getOnlyNames = (dictionary: any) => {
  let result = []
  for (let element of dictionary) {
    result.push(element.name)
  }
  console.log(result)
  return result
}

const arraysEqual = (a, b) => {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false
  }
  return true
}

const getUpdatedSpots = (newList: string[], defaultList: string[]) => {
  const changedSpots = {}
  for (let i = 0; i <= defaultList.length; i++) {
    if (defaultList[i] !== newList[i]) {
      changedSpots[defaultList[i]] = newList.indexOf(defaultList[i]) + 1
    }
  }

  return changedSpots
}

const Home = ({ teamsData, playersData }) => {
  const toast = useToast()
  const { isOpen: isOpenTeam, onOpen: onOpenTeam, onClose: onCloseTeam } = useDisclosure()
  const { isOpen: isOpenPlayer, onOpen: onOpenPlayer, onClose: onClosePlayer } = useDisclosure()

  const [teamToVote, setTeamToVote] = useState(undefined)
  const [playerToVote, setPlayerToVote] = useState(undefined)
  const [searchTeam, setSearchTeam] = useState('')
  const [searchPlayerName, setSearchPlayerName] = useState('')

  const handleTeamNameChange = event => setSearchTeam(event.target.value)
  const handlePlayerNameChange = event => setSearchPlayerName(event.target.value)

  Teams.sort((a: Team, b: Team) => {
    const getSpotA = getSpot(teamsData[a.name].sumOfVotes, teamsData[a.name].numberOfVotes)
    const getSpotB = getSpot(teamsData[b.name].sumOfVotes, teamsData[b.name].numberOfVotes)

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
    const getSpotA = getSpot(playersData[a.name].sumOfVotes, playersData[a.name].numberOfVotes)
    const getSpotB = getSpot(playersData[b.name].sumOfVotes, playersData[b.name].numberOfVotes)

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

      <Text fontSize="3.5rem" textAlign="center" mt="1rem" bgClip="text" fill="transparent" bgColor="#da99ff" bgGradient="radial-gradient(at 87% 44%, hsla(223,70%,78%,1) 0px, transparent 50%), radial-gradient(at 76% 71%, hsla(260,97%,61%,1) 0px, transparent 50%), radial-gradient(at 90% 10%, hsla(338,78%,60%,1) 0px, transparent 50%), radial-gradient(at 32% 68%, hsla(357,99%,79%,1) 0px, transparent 50%), radial-gradient(at 62% 29%, hsla(284,73%,79%,1) 0px, transparent 50%), radial-gradient(at 35% 23%, hsla(195,91%,76%,1) 0px, transparent 50%), radial-gradient(at 71% 80%, hsla(315,99%,69%,1) 0px, transparent 50%);" >The Community Ranking</Text>

      <Center mt="1rem"><Box p="0.7rem" borderRadius="9999px" bgGradient="radial-gradient(at 87% 44%, hsla(223,70%,78%,1) 0px, transparent 50%), radial-gradient(at 76% 71%, hsla(260,97%,61%,1) 0px, transparent 50%), radial-gradient(at 90% 10%, hsla(338,78%,60%,1) 0px, transparent 50%), radial-gradient(at 32% 68%, hsla(357,99%,79%,1) 0px, transparent 50%), radial-gradient(at 62% 29%, hsla(284,73%,79%,1) 0px, transparent 50%), radial-gradient(at 35% 23%, hsla(195,91%,76%,1) 0px, transparent 50%), radial-gradient(at 71% 80%, hsla(315,99%,69%,1) 0px, transparent 50%);"><span style={{ color: '#000', borderRadius: '9999px', fontSize: '1.5rem' }}>Vote responsibly</span></Box></Center>

      <Tabs isLazy defaultIndex={tabIndex} onChange={handleTabsChange} variant="soft-rounded">
        <Center>
          <TabList mt="2rem">
            <Tab>Teams</Tab>
            <Tab>Players</Tab>
          </TabList>
        </Center>
        <TabPanels>
          <TabPanel>
            <Button onClick={() => {
              const updatedSpots = getUpdatedSpots(getOnlyNames(teamsList), getOnlyNames(Teams))
              Promise.all(Object.keys(updatedSpots).map(element => {
                writeTeamData(element, updatedSpots[element])
              })).then(() => setTimeout(() => window.location.reload(), 2000))
            }} zIndex="999" position="fixed" bottom="5" right="5" isDisabled={arraysEqual(getOnlyNames(teamsList), getOnlyNames(Teams)) ? true : false}>Apply spots</Button>
            <Center>
              <VStack spacing="2rem" id="teamsList">
                <Input mt="0.5rem" width="22.4rem" placeholder="Enter the team name" value={searchTeam} onChange={handleTeamNameChange} />
                <ReactSortable
                  id="a"
                  filter=".addImageButtonContainer"
                  dragClass="sortableDrag"
                  list={teamsList}
                  setList={setTeamsList}
                  animation={200}
                >
                  {Object.keys(teamsList).map((key: string) => {
                    if (teamsList[key].name.toLowerCase().includes(searchTeam.toLowerCase())) {
                      return (
                        <HStack justifyContent={{ base: 'center', '474px': 'left' }} backgroundColor="#111827" height="6rem" width={{ base: '7rem', '474px': '22rem', '1100px': '23rem' }} rounded="lg" borderWidth="2px" borderColor="#374151">
                          <HStack>
                            <HStack px="1rem" spacing="0.7rem">
                              <Text>#{teamSpots.indexOf(Teams[key].name)+1}</Text>
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
                    }
                  })}
                </ReactSortable>
              </VStack>
            </Center>
          </TabPanel>
          <TabPanel>
            <Button onClick={() => {
              const updatedSpots = getUpdatedSpots(getOnlyNames(playersList), getOnlyNames(Players))
              Promise.all(Object.keys(updatedSpots).map(element => {
                writePlayerData(element, updatedSpots[element])
              })).then(() => setTimeout(() => window.location.reload(), 2000))
            }} zIndex="999" position="fixed" bottom="5" right="5" isDisabled={arraysEqual(getOnlyNames(playersList), getOnlyNames(Players)) ? true : false}>Apply spots</Button>
            <Center>
              <VStack spacing="2rem" id="playersList">
                <Input mt="0.5rem" width="22.4rem" placeholder="Enter the player name" value={searchPlayerName} onChange={handlePlayerNameChange} />
                <ReactSortable
                  filter=".addImageButtonContainer"
                  dragClass="sortableDrag"
                  list={playersList}
                  setList={setPlayersList}
                  animation={200}
                >
                  {Object.keys(playersList).map((key: string) => {
                    if (playersList[key].name.toLowerCase().includes(searchPlayerName.toLowerCase())) {
                      return (
                        <HStack justifyContent={{ base: 'center', '474px': 'left' }} backgroundColor="#111827" height="6rem" width={{ base: '7rem', '474px': '12rem' }} rounded="lg" borderWidth="2px" borderColor="#374151">
                          <HStack>
                            <HStack px="1rem" spacing="0.7rem">
                              <Text>#{playerSpots.indexOf(Players[key].name)+1}</Text>
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


export async function getServerSideProps({ req, res }) {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  )
  
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


  return { props: { teamsData, playersData } }
}

export default Home
