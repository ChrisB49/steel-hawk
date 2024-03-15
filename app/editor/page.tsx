'use client'
import { Container, Flex, Text, Link, Stack, VStack, HStack, Heading, Button } from '@chakra-ui/react'
import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
    Switch,
    Center
} from '@chakra-ui/react'

import { FaPlay } from "react-icons/fa";
import { MdSkipPrevious, MdOutlineSkipNext, MdOutlineRepeat, MdOutlineVolumeUp } from "react-icons/md";
import { AiOutlineFullscreen } from "react-icons/ai";
import { AddIcon, EditIcon } from '@chakra-ui/icons'

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

export function EditorPane() {
    return (
        <Container rounded={10} bg='white' minW='80vw' minH="80vh">
            <VStack align="center" direction="column" spacing={2}>
                <Heading size="md" color="gray">Transcript Editor</Heading>
                <Container bg='white' h={400} w='full'>
                    <Text>Transcription Contents Go Here</Text>
                </Container>
            </VStack>
        </Container>
    )
}

export function TranscriptSearch() {
    return (
        <Container rounded={7} bg='white' h='30px' border="2px" borderColor="black">
            <h1> TranscriptSearch</h1>
        </Container >
    )
}

export function TranscriptSearchResults() {
    return (
        <Container rounded={10} bg='white' h='300px' w='100%'>
            <Text>Results go here</Text>
            <Text>Results go here</Text>
            <Text>Results go here</Text>
            <Text>Results go here</Text>
        </Container>
    )
}

export function Transcript() {
    return (
        <Container rounded={10} bg='white' w='100%' h='70vh'>
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

export function SeekBar() {
    return (
        <Container rounded={10} bg='Black' h={50} w={600}>
            <Slider aria-label='slider-ex-2' colorScheme='green' defaultValue={30}>
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
        </Container>
    )
}

export function SpeedSelector() {
    return (
        <Container rounded={10} bg='gray' h={6} w={10}>
            <Center>
                <Text color="white">1x</Text>
            </Center>
        </Container>
    )
}

export function VolumeBar() {
    return (
        <HStack minW="5vw">
            <MdOutlineVolumeUp color="gray" size="2em" />
            <Slider aria-label='slider-ex-2' colorScheme='green' defaultValue={30}>
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
        </HStack>
    )
}

export function Maximizer() {
    return (
        <AiOutlineFullscreen color="gray" size="2em" />
    )
}

export function PlayerBar() {
    return (
        <Center rounded={10} bg='Black' minH="20vh" minW="80vw">
            <HStack align="center" spacing={2}>
                <VStack>
                    <HStack>
                        <MdSkipPrevious color="gray" size="1.5em" />
                        <FaPlay color="white" size=".8em" />
                        <MdOutlineSkipNext color="gray" size="1.5em" />
                        <MdOutlineRepeat color="gray" size="1.5em" />
                        <SpeedSelector />
                    </HStack>
                    <Container w="fill" h={20}>
                        <HStack alignItems="center">
                            <Text color="gray">00:00</Text>
                            <SeekBar />
                            <Text color="gray">00:00</Text>
                        </HStack>
                    </Container>
                </VStack>
                <ConfidenceSelector />
                <VolumeBar />
                <Maximizer />
            </HStack>
        </Center >
    )
}

export function ConfidenceSelector() {
    return (
        <HStack>
            <Switch colorScheme="green" size="lg" />
            <Heading size="sm" color="white">Confidence</Heading>
        </HStack>
    )
}


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