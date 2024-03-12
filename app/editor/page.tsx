'use client'
import { Container, Flex, Link, Stack } from '@chakra-ui/react'

export function UtilityMenu() {
    return (
        <Container bg='blue' w='100%' h='350px'>
            <h1>UtilityMenu</h1>
        </Container>
    )
}

export function EditorPane() {
    return (
        <Container bg='red' w='50%' h='50%'>
            <h1>EditorPane</h1>
        </Container>
    )
}

export function TranscriptSearch() {
    return (
        <Container bg='purple' h='30px'>
            <h1>TranscriptSearch</h1>
        </Container>
    )

}

export function TranscriptSelector() {
    return (
        <Container bg='yellow' w='100%' h='80%'>
            <Flex justify="space-evenly" align="center" direction="column">
                <TranscriptSearch />
                <Container bg='yellow'>
                    <h1>TranscriptSelector</h1>
                </Container>
            </Flex>
        </Container>
    )
}

export function Player() {
    return (
        <Container bg='green' w='300px' h='30px'>
            <h1>Player</h1>
        </Container>
    )
}



export default function Page() {
    return (
        <Container bg="yellow" w="100%" h="100%">
            <Flex justify="space-between" align="center">
                <Stack direction={'column'} align={"center"} spacing={"30px"}>
                    <UtilityMenu />
                    <TranscriptSelector />
                </Stack>
                <Flex direction={'column'}>
                    <EditorPane />
                    <Player />
                </Flex>
            </Flex>
        </Container>
    )
}