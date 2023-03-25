import Head from 'next/head'
import {
  VStack,
  Text,
  Image,
  HStack,
  Center,
  Box,
  Hide,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Show,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  ModalFooter,
  Checkbox,
  useDisclosure,
  useToast
} from '@chakra-ui/react'
import Teams from '../lib/teams.json'
import Players from '../lib/players.json'
import { useEffect, useState } from 'react'
import { isNull } from 'util'
import { ReactSortable } from 'react-sortablejs'
import {
  writeIP,
  writePlayersData,
  writeTeamsData,
  retrieveAllIPs,
  retrieveIP,
  retrievePlayerData,
  retrieveTeamData,
  removeIP
} from '../lib/database'
import useTabIndex from '../lib/tabIndex'
import { Info } from '../components/Info'
import { Guide } from '../components/Guide'

const ELAPSED_TO_WAIT = process.env.NEXT_PUBLIC_ELAPSED_TO_WAIT

const getList = dictionary => {
  let ret = []
  for (let element of dictionary) {
    ret.push(element.name)
  }

  return ret
}

const Home = ({ teamsData, playersData, ipToUse, ip }) => {
  ip = ip || { ip: ipToUse, addedAt: ELAPSED_TO_WAIT }
  const date = new Date()
  const time = date.getTime()
  
  const elapsed = time - ip.addedAt

  const toast = useToast()

  Teams.sort((a, b) => {
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

  Players.sort((a, b) => {
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
  
  const [teamsList, setTeamsList] = useState(Teams)
  const [playersList, setPlayersList] = useState(Players)
  
  const [hasVoted, setHasVoted] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [voteForTeams, setVoteForTeams] = useState(false)
  const [voteForPlayers, setVoteForPlayers] = useState(false)
  const [currentTimer, setCurrentTimer] = useState(ELAPSED_TO_WAIT - elapsed)

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = currentTimer - 60000
      setCurrentTimer(delta)
    }, 60000)

    return () => clearInterval(interval)
  })

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
                  status: 'error',
                  isClosable: true
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
      
      {(elapsed <= ELAPSED_TO_WAIT || (currentTimer - 60000 >= 60000)) && (
        <Box zIndex="1" py="0.08rem" width="full" backgroundColor="yellow.500" position="sticky" top="0" textAlign="center">Temporary cooldown for {Math.ceil(currentTimer / 60000)} minute(s)</Box>
      )}

      <Text fontSize="2.5rem" textAlign="center" mt="1rem" bgClip="text" fill="transparent" bgColor="#da99ff" bgGradient="radial-gradient(at 87% 44%, hsla(223,70%,78%,1) 0px, transparent 50%), radial-gradient(at 76% 71%, hsla(260,97%,61%,1) 0px, transparent 50%), radial-gradient(at 90% 10%, hsla(338,78%,60%,1) 0px, transparent 50%), radial-gradient(at 32% 68%, hsla(357,99%,79%,1) 0px, transparent 50%), radial-gradient(at 62% 29%, hsla(284,73%,79%,1) 0px, transparent 50%), radial-gradient(at 35% 23%, hsla(195,91%,76%,1) 0px, transparent 50%), radial-gradient(at 71% 80%, hsla(315,99%,69%,1) 0px, transparent 50%);">The Community Ranking</Text>

      <Center mt="1rem"><Box p="0.7rem" borderRadius="9999px" bgGradient="radial-gradient(at 87% 44%, hsla(223,70%,78%,1) 0px, transparent 50%), radial-gradient(at 76% 71%, hsla(260,97%,61%,1) 0px, transparent 50%), radial-gradient(at 90% 10%, hsla(338,78%,60%,1) 0px, transparent 50%), radial-gradient(at 32% 68%, hsla(357,99%,79%,1) 0px, transparent 50%), radial-gradient(at 62% 29%, hsla(284,73%,79%,1) 0px, transparent 50%), radial-gradient(at 35% 23%, hsla(195,91%,76%,1) 0px, transparent 50%), radial-gradient(at 71% 80%, hsla(315,99%,69%,1) 0px, transparent 50%);"><span style={{ color: '#000', borderRadius: '9999px', fontSize: '1.5rem' }}>Vote responsibly</span></Box></Center>

      {(currentTimer <= 0) || (!isNaN(currentTimer)) && (
        <Button onClick={onOpen} zIndex="2" position="fixed" bottom="5" right="5">Apply spots</Button>
      )}

      <Tabs isLazy defaultIndex={tabIndex} onChange={index => changeTabIndex(index)} variant="soft-rounded">
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
                <ReactSortable
                  id="a"
                  filter=".addImageButtonContainer"
                  dragClass="sortableDrag"
                  list={teamsList}
                  setList={setTeamsList}
                  animation={200}
                >
                  {Object.keys(teamsList).map(key => {
                    return (
                      <HStack justifyContent={{ base: 'center', '474px': 'left' }} backgroundColor="#111827" height="6rem" width={{ base: '7rem', '474px': '22rem', '1100px': '23rem' }} rounded="lg" borderWidth="2px" borderColor="#374151">
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
                <ReactSortable
                  filter=".addImageButtonContainer"
                  dragClass="sortableDrag"
                  list={playersList}
                  setList={setPlayersList}
                  animation={200}
                >
                  {Object.keys(playersList).map(key => {
                    return (
                      <HStack justifyContent={{ base: 'center', '474px': 'left' }} backgroundColor="#111827" height="6rem" width={{ base: '7rem', '474px': '12rem' }} rounded="lg" borderWidth="2px" borderColor="#374151">
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
                  })}
                </ReactSortable>
              </VStack>
            </Center>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}

export const getServerSideProps = async ({ req }) => {
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

  const ipToUse = req.socket.remoteAddress.replaceAll('.', '')
  
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
        removeIP(key)
      }
    })
  }

  return { props: { teamsData, playersData, ipToUse, ip } }
}

export default Home
