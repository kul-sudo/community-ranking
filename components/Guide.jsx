import {
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  ListItem,
  Button,
  OrderedList,
  useDisclosure
} from '@chakra-ui/react'
import { QuestionIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'

export const Guide = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Info</ModalHeader>
          <ModalBody pb="2rem">
            <OrderedList spacing="0.5rem" fontSize="1.3rem" textAlign="left">
              <ListItem>
                Haul the teams/players to different directions to change their spots. Once you are done, press
                <Button width="7rem" height="2rem" ml="10px" mr="10px">
                  Apply spots
                </Button>
                and confirm the action.
              </ListItem>
              <ListItem>
                Press
                <Button colorScheme="blue" width="3.5rem" height="2rem" ml="10px" mr="10px">
                  Vote
                </Button>
                when you have checked the checkboxes you need.
              </ListItem>
              <ListItem>The page reloads after you vote.</ListItem>
              <ListItem>Remember that you can vote without changing the spots and confirm the current ones.</ListItem>
            </OrderedList>
          </ModalBody>
          <ModalCloseButton />
        </ModalContent>
      </Modal>

      <IconButton
        zIndex="999"
        position="fixed"
        bottom="3"
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