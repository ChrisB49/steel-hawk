import { Center, Container, Text, HStack, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Switch, Heading, VStack } from "@chakra-ui/react"
import { AiOutlineFullscreen } from "react-icons/ai"
import { FaPlay } from "react-icons/fa"
import { MdOutlineRepeat, MdOutlineSkipNext, MdOutlineVolumeUp, MdSkipPrevious } from "react-icons/md"


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

export function ConfidenceSelector() {
    return (
        <HStack>
            <Switch colorScheme="green" size="lg" />
            <Heading size="sm" color="white">Confidence</Heading>
        </HStack>
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

