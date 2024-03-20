'use client'
import { Button, Container, HStack, Image, Link, VStack, } from '@chakra-ui/react'
import { AddIcon, EditIcon } from '@chakra-ui/icons';

export function UtilityMenu() {
    return (
        <Container rounded={10} bg='black'>
            <HStack align="center" direction="column" spacing={2}>
                <Image src="static/img/nammu_logo_inverted.png" alt="Logo" w="150px" h="150px" />
                <VStack>
                    <Button leftIcon={<AddIcon />} colorScheme="blue" size="md" w='35vh'>
                        <Link href='/'>New Transcription</Link>
                    </Button>
                    <Button leftIcon={<EditIcon />} colorScheme="blue" size="md" w='35vh' >
                        <Link href='/'>Format/Export</Link>
                    </Button>
                </VStack>
            </HStack>
        </Container >
    )
}