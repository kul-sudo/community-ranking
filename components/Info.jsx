import {
  Text,
  Center,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ListItem,
  UnorderedList,
  useDisclosure
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'

export const Info = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Info</ModalHeader>
          <ModalBody pb="2rem">
            <Center>
              <Text fontSize="1.5rem" textAlign="center">Vote for the spots of teams and players!</Text>
            </Center>
            <UnorderedList mt="1rem" fontSize="1.3rem">
              <ListItem>For both teams and players there are 30 spots.</ListItem>
              <ListItem>The teams and players are sorted by the sum of votes done by the users.</ListItem>
            </UnorderedList>
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
        icon={<InfoIcon boxSize="30" />}
        onClick={onOpen}
      />
    </>
  )
}