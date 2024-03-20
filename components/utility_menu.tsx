'use client'
import { Button, Container, Link, VStack, } from '@chakra-ui/react'
import { AddIcon, EditIcon } from '@chakra-ui/icons';

export function UtilityMenu() {
    return (
        <Container rounded={10} bg='black.50' w='100%' h="10vh">
            <VStack align="center" direction="column" spacing={2}>
                <Button leftIcon={<AddIcon />} colorScheme="blue" size="md" w="full">
                    <Link href='/'>New Transcription</Link>
                </Button>
                <Button leftIcon={<EditIcon />} colorScheme="blue" size="md" w="full" >
                    <Link href='/'>Format/Export</Link>
                </Button>
            </VStack>
        </Container >
    )
}