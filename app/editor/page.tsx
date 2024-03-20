'use client'
import { Container, Flex, Text, Link, Stack, VStack, HStack, Heading, } from '@chakra-ui/react'


import { Transcript } from "@/components/transcription_search_pane";
import { UtilityMenu } from '@/components/utility_menu';
import { PlayerBar } from '@/components/audio_controls';
import { EditorPane } from '@/components/transcript_editor';

export default function Page() {
    return (
        <Container bg="black" minWidth="100%" minHeight="100vh">
            <HStack align="top" spacing={3}>
                <VStack align="left" direction="column" spacing={3} minW='15vw'>
                    <Heading color={"white"} size="lg">Nammu Editor</Heading>
                    <VStack direction={'column'} align={"center"} spacing={3} maxW={500}>
                        <UtilityMenu />
                        <Transcript />
                    </VStack>
                </VStack>
                <VStack pt={4}>
                    <EditorPane />
                    <PlayerBar />
                </VStack>
            </HStack>
        </Container>
    )
}