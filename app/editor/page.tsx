'use client'
import { Container, Flex, Text, Link, Stack, VStack, HStack, Heading, } from '@chakra-ui/react'


import { Transcript } from "@/components/transcription_search_pane";
import { UtilityMenu } from '@/components/utility_menu';
import { PlayerBar } from '@/components/audio_controls';
import { EditorPane } from '@/components/transcript_editor';

export default function Page() {
    return (
        <Container bg="black" minWidth="100%" minHeight="100vh">
            <VStack>
                <HStack align="top" spacing={3}>
                    <VStack align="left" direction="column" pt={3} minW='15vw' minH='80vh'>
                        <Transcript />
                    </VStack>
                    <VStack pt={3} minH='80vh'>
                        <EditorPane />
                    </VStack>
                </HStack>
                <HStack>
                    <UtilityMenu />
                    <PlayerBar />
                </HStack>
            </VStack>
        </Container>
    )
}