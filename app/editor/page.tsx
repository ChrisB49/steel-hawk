'use client'
import { Container, Flex, Text, Link, Stack, VStack, HStack, Heading, Button } from '@chakra-ui/react'
import { AddIcon, EditIcon } from '@chakra-ui/icons'
export function UtilityMenu() {
    return (
        <Container rounded={10} bg='black.50' w='100%' p={3}>
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

export function EditorPane() {
    return (
        <Container rounded={10} bg='white' h={500} w={600}>
            <h1>EditorPane</h1>
        </Container>
    )
}

export function TranscriptSearch() {
    return (
        <Container rounded={7} bg='white' h='30px' border="2px" borderColor="black">
            < h1 > TranscriptSearch</h1 >
        </Container >
    )
}

export function TranscriptSearchResults() {
    return (
        <Container rounded={10} bg='white' h='300px' w='100%'>
            <h1>TranscriptSearchResults</h1>
        </Container>
    )
}

export function Transcript() {
    return (
        <Container rounded={10} bg='white' w='100%' h='450px'>
            <VStack justify="space-evenly" align="center" direction="column" py={5} spacing={2}>
                <Heading>Transcripts</Heading>
                <TranscriptSearch />
                <Container bg='white'>
                    <TranscriptSearchResults />
                </Container>
            </VStack>
        </Container>
    )
}

export function PlayerBar() {
    return (
        <Container bg='green' w='300px' h='30px'>
            <h1>Player</h1>
        </Container>
    )
}



export default function Page() {
    return (
        <Container bg="black" rounded={10} maxW="container.xl" py={20} px={3}>
            <Heading color={"white"} size="lg">Nammu Editor</Heading>
            <HStack align="center" spacing={6}>
                <VStack direction={'column'} align={"center"} spacing={"30px"} maxW={500}>
                    <UtilityMenu />
                    <Transcript />
                </VStack>
                <VStack direction={'column'} maxW="fill" align="center">
                    <EditorPane />
                    <PlayerBar />
                </VStack>
            </HStack>
        </Container>
    )
}