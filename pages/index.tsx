import Head from 'next/head'
import { AlertDialog, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, VStack, Text, Image, Grid, HStack, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Button, useToast, Breadcrumb, BreadcrumbItem, useDisclosure, AlertDialogBody, AlertDialogCloseButton, Center } from '@chakra-ui/react'
import Teams from '../lib/teams.json'
import { initializeApp } from 'firebase/app'
import { get, getDatabase, increment, ref, set } from 'firebase/database'
import { useState } from 'react'
import { InfoIcon } from '@chakra-ui/icons'

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
  set(ref(db, teamName), {
    numberOfVotes: increment(1),
    sumOfVotes: increment(spot)
  })
}

const retrieveTeamData = async (teamName: string) => {
  const snapshot = await get(ref(db, teamName))
  return snapshot.val()
}

const getSpot = (sumOfVotes: number, numberOfVotes: number) => {
  const predefined = sumOfVotes / numberOfVotes
  return isNaN(predefined) ? 0: predefined
}


const Home = ({ teamsData }) => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [teamToVote, setTeamToVote] = useState(undefined)
  let retrieved = {}
    
  Teams.sort((a: Team, b: Team) => {
    const getSpotA = getSpot(teamsData[a.name].sumOfVotes, teamsData[a.name].numberOfVotes)
    const getSpotB = getSpot(teamsData[b.name].sumOfVotes, teamsData[b.name].numberOfVotes)
    retrieved[a.name] = getSpotA
    retrieved[b.name] = getSpotB

    if (getSpotA > getSpotB) {
      return 1
    } else if (getSpotA < getSpotB) {
      return -1
    } else {
      return 0
    }
  })

  //let allRetrievedSpots = []
  //f//or (let element in retrieved) {
 ///   allRetrievedSpots.push(retrieved[element])
  //}


  //let oneToThirty = Array.from({length: 30}, (_, index) => index + 1)
  //console.log(allRetrievedSpots)
  //c//onsole.log(oneToThirty)

  //for (let i = 0; i = 30; i++) {
    //if (allRetrievedSpots[i])
 // }
  //

  let teamSpots = []
  Teams.map(key => {
    teamSpots.push(key.name)
  })

  return (
    <>
      <Head>
        <title>Counter-Strike Pick'ems</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AlertDialog
        isCentered
        isOpen={isOpen}
        onClose={onClose}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            Confirmation of the vote
          </AlertDialogHeader>
          <AlertDialogCloseButton />

          <AlertDialogBody>
            Are you sure you'd like to do the vote?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button variant="outline" colorScheme="teal" onClick={() => {
              onClose()
              writeTeamData(document.getElementById(`${Teams[teamToVote].name}-team-name`).innerText, parseInt(document.getElementById(`${Teams[teamToVote].name}-input`).value))
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
      <Text fontSize="4rem" textAlign="center" mt="1rem">The Community Ranking</Text>

      <Center>
        <VStack mt="1rem" spacing={2}>
          <HStack>
            <InfoIcon boxSize="3rem" />
            <Text textAlign="center" fontSize="1.5rem">Spots in total: 30<br />Maximum spot: 30<br /></Text>
          </HStack>
          <Text textAlign="center" fontSize="1.5rem">Once you have opted for the spot,<br />you can refresh the page</Text>
        </VStack>
      </Center>

      <Center mt="1rem">
        <Grid gridAutoFlow="row" rowGap="2rem">
          {Object.keys(Teams).map((key: string) => (
            <VStack>
              <HStack spacing="1rem">
                <NumberInput id={`${Teams[key].name}-input`} keepWithinRange={true} defaultValue={teamSpots.indexOf(Teams[key].name)+1} min={1} max={30}>
                  <NumberInputField width="9rem" height="5.5rem" textAlign="center" fontSize="1.8rem" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <VStack spacing="0.5rem">
                  <Center backgroundColor="#262a33" borderRadius="8px" width="9rem" height="5.5rem" mt="2rem">
                    <Image
                      src={Teams[key].logo}
                      draggable={false}
                      width="3.5rem"
                      height="auto"
                      />
                  </Center>
                  <Text id={`${Teams[key].name}-team-name`} fontWeight="600">{Teams[key].name}</Text>
                </VStack>
              </HStack>
              <Button variant="outline" colorScheme="teal" onClick={() => {
                setTeamToVote(key)
                onOpen()
              }}>Vote</Button>
            </VStack>
          ))}
        </Grid>
      </Center>
    </>
  )
}


export async function getServerSideProps() {
  let teamsData = {}

  await Promise.all(Teams.map(async team => {
    return retrieveTeamData(team.name).then(snapshot => {
      teamsData[team.name] = snapshot
    })
  }))

  return { props: { teamsData } }
}

export default Home
