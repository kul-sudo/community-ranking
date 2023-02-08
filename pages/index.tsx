import Head from 'next/head'
import { AlertDialog, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, VStack, Text, Image, Grid, HStack, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Button, AlertDialogBody, AlertDialogCloseButton, Center, DarkMode, Box, Input, Hide, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ListItem, OrderedList, Tabs, TabList, TabPanels, Tab, TabPanel, useDisclosure, useToast } from '@chakra-ui/react'
import { InfoIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import Teams from '../lib/teams.json'
import Players from '../lib/players.json'
import { initializeApp } from 'firebase/app'
import { get, getDatabase, increment, ref, set } from 'firebase/database'
import { useState } from 'react'
import create from 'zustand'
import { persist } from 'zustand/middleware'

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
  }).then(() => {
      window.location.reload()
    })
}

const writePlayerData = (playerName: string, spot: number) => {
  set(ref(db, `players/${playerName}`), {
    numberOfVotes: increment(1),
    sumOfVotes: increment(spot)
  }).then(() => {
      window.location.reload()
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
        position="fixed"
        top="1"
        left="1"
        variant="ghost"
        rounded="full"
        boxSize="4rem"
        icon={<InfoIcon boxSize="30" />}
        onClick={onOpen}
      />
    </>
  )
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

  return (
    <>
      <Head>
        <title>Counter-Strike Community Ranking</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Info />

      <AlertDialog
        isCentered
        onClose={onCloseTeam}
        isOpen={isOpenTeam}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            Confirmation of the vote
          </AlertDialogHeader>
          <AlertDialogCloseButton />

          <AlertDialogBody>
            Are you sure you&apos;d like to do the vote?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button variant="outline" colorScheme="teal" onClick={() => {
              onCloseTeam()
              const parsedInput = document.getElementById(`${Teams[teamToVote].name}-input`).value
              if (parsedInput === '') {
                toast({
                  title: 'Error',
                  description: 'There is no number in the input',
                  status: 'error',
                  duration: 5000,
                  isClosable: true
                })
                return
              }
              writeTeamData(Teams[teamToVote].name, parseInt(parsedInput))
              toast({
                title: 'Success',
                description: 'Your vote has been included',
                status: 'success',
                duration: 5000,
                isClosable: true
              })
            }}>Confirm the vote</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        isCentered
        onClose={onClosePlayer}
        isOpen={isOpenPlayer}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            Confirmation of the vote
          </AlertDialogHeader>
          <AlertDialogCloseButton />

          <AlertDialogBody>
            Are you sure you&apos;d like to do the vote?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button variant="outline" colorScheme="teal" onClick={() => {
              onClosePlayer()
              const parsedInput = document.getElementById(`${Players[playerToVote].name}-input`).value
              if (parsedInput === '') {
                toast({
                  title: 'Error',
                  description: 'There is no number in the input',
                  status: 'error',
                  duration: 5000,
                  isClosable: true
                })
                return
              }
              writePlayerData(Players[playerToVote].name, parseInt(parsedInput))
              toast({
                title: 'Success',
                description: 'Your vote has been included',
                status: 'success',
                duration: 5000,
                isClosable: true
              })
            }}>Confirm the vote</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


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
            <Center>
              <VStack spacing="2rem" id="teamsList">
                <Input mt="0.5rem" width="22.4rem" placeholder="Enter the team name" value={searchTeam} onChange={handleTeamNameChange} />
                {Object.keys(Teams).map((key: string) => {
                  if (Teams[key].name.toLowerCase().includes(searchTeam.toLowerCase())) {
                    return (
                      <HStack position="relative" justifyContent="center" backgroundColor="#111827" height="6rem" width={{ base: '20rem', '600px': '36rem', '1100px': '36rem' }} rounded="lg" borderWidth="2px" borderColor="#374151">
                        <HStack>
                          <HStack spacing="1rem" position="absolute" left={{ base: '14%', '600px': '10%' }}>
                            <Image
                              src={Teams[key].logo}
                              draggable={false}
                              width={{ base: '2.5rem', '1100px': '2.7rem' }}
                              height="auto"
                            />
                            <Hide breakpoint="(max-width: 600px)">
                              <VStack alignItems="left">
                                <Text id={`${Teams[key].name}-team-name`} color="#fff" fontWeight="600" fontSize={{ base: '0.9rem', '1100px': '1rem' }}>{Teams[key].name}</Text>
                                <HStack>
                                  {Array.from(Teams[key].players.sort()).map(player => {
                                    return (
                                      <Text fontSize="0.7rem">{player}</Text>
                                    )
                                  })}
                                </HStack>
                              </VStack>
                            </Hide>
                          </HStack>
                          <HStack spacing="1rem" position="absolute" right="2rem">
                            <DarkMode>
                              <NumberInput id={`${Teams[key].name}-input`} keepWithinRange={true} color="#fff" defaultValue={teamSpots.indexOf(Teams[key].name)+1} min={1} max={30}>
                                <NumberInputField width={{ base: '5rem', '1100px': '5.5rem' }} height={{ base: '2.5rem', '1100px': '2.7rem' }} textAlign="center" fontSize={{ base: '1.2rem', '1100px': '1.2rem' }} />
                                <NumberInputStepper>
                                  <NumberDecrementStepper children={<TriangleUpIcon />} />
                                  <NumberIncrementStepper children={<TriangleDownIcon />} />
                                </NumberInputStepper>
                              </NumberInput>
                            </DarkMode>
                            <DarkMode>
                              <Button width={{ base: '4.356rem', '1100px': '4.3rem' }} height={{ base: '2.2rem', '1100px': '2.5rem' }} variant="outline" colorScheme="teal" onClick={() => {
                                setTeamToVote(key)
                                onOpenTeam()
                              }}>Vote</Button>
                            </DarkMode>
                          </HStack>
                        </HStack>
                      </HStack>
                    )
                  }
                })}
              </VStack>
            </Center>
          </TabPanel>
          <TabPanel>
            <Center>
              <VStack spacing="2rem" id="playersList">
                <Input mt="0.5rem" width="22.4rem" placeholder="Enter the player name" value={searchPlayerName} onChange={handlePlayerNameChange} />
                {Object.keys(Players).map((key: string) => {
                  if (Players[key].name.toLowerCase().includes(searchPlayerName.toLowerCase())) {
                    return (
                      <HStack position="relative" justifyContent="center" backgroundColor="#111827" height="6rem" width={{ base: '20rem', '446px': '27rem', '1100px': '27.5rem' }} rounded="lg" borderWidth="2px" borderColor="#374151">
                        <HStack>
                          <HStack spacing="0.4rem" position="absolute" left="2.5rem">
                            <Image
                              src={Players[key].logo}
                              draggable={false}
                              width={{ base: '3rem', '1100px': '4rem' }}
                              height="auto"
                              rounded="full"
                              />
                            <Hide breakpoint="(max-width: 446px)">
                              <Text id={`${Players[key].name}-team-name`} color="#fff" fontWeight="600" fontSize={{ base: '0.9rem', '1100px': '0.85rem' }}>{Players[key].name}</Text>
                            </Hide>
                          </HStack>
                          <HStack spacing="1rem" position="absolute" right="2rem">
                            <DarkMode>
                              <NumberInput id={`${Players[key].name}-input`} keepWithinRange={true} color="#fff" defaultValue={playerSpots.indexOf(Players[key].name)+1} min={1} max={30}>
                                <NumberInputField width={{ base: '5rem', '1100px': '5.5rem' }} height={{ base: '2.5rem', '1100px': '2.7rem' }} textAlign="center" fontSize={{ base: '1.2rem', '1100px': '1.2rem' }} />
                                <NumberInputStepper>
                                  <NumberDecrementStepper children={<TriangleUpIcon />} />
                                  <NumberIncrementStepper children={<TriangleDownIcon />} />
                                </NumberInputStepper>
                              </NumberInput>
                            </DarkMode>
                            <DarkMode>
                              <Button width={{ base: '4.356rem', '1100px': '4.3rem' }} height={{ base: '2.2rem', '1100px': '2.5rem' }} variant="outline" colorScheme="teal" onClick={() => {
                                setPlayerToVote(key)
                                onOpenPlayer()
                              }}>Vote</Button>
                            </DarkMode>
                          </HStack>
                        </HStack>
                      </HStack>
                    )
                  }
                  }
                )}
              </VStack>
            </Center>
          </TabPanel>
        </TabPanels>
      </Tabs>
      {((((document.getElementById('teamsList')?.children.length < 1)) - 1) || (((document.getElementById('playersList')?.children.length < 1)))) && (
        <Center mt="1rem">
          <Text>{`No ${tabIndex === 0 ? 'teams' : 'players'} found`}</Text>
        </Center>
      )}
    </>
  )
}


export async function getServerSideProps() {
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
