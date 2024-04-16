import { Center, Container, Text, HStack, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Switch, Heading, VStack } from "@chakra-ui/react"
import { AiOutlineFullscreen } from "react-icons/ai"
import { FaPlay,FaPause } from "react-icons/fa"
import { MdOutlineRepeat, MdOutlineSkipNext, MdOutlineVolumeUp, MdOutlineVolumeOff, MdSkipPrevious } from "react-icons/md"
import { observer } from 'mobx-react-lite';
import { uiStore } from '@/stores/UIStore';
import { formatTime } from "@/app/lib/utilities";

export const GreenThresholdSlider = observer(() => {
    return (
        <VStack>
            <Text color="white">Confidence Threshold</Text>
            <Slider
                aria-label="green-threshold-slider"
                defaultValue={uiStore.getConfidenceDisplayThreshold() * 10}
                min={6}
                max={11}
                onChange={(value) => uiStore.setConfidenceDisplayThreshold(value / 10)}
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
        </VStack>
    );
});

export const SeekBar = observer(() => {
    const handleSliderChange = (value: number) => {
        uiStore.userInitiatedSeek(value);
    };

    return (
        <Container rounded={10} bg='Black' h={50} w={600}>
            <Slider
                aria-label='seek-slider'
                colorScheme='green'
                value={uiStore.getSeekPosition()}
                min={0}
                max={uiStore.getDuration()}
                onChange={handleSliderChange} // Update seek position on change
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
        </Container>
    );
});

export function SpeedSelector() {
    return (
        <Container rounded={10} bg='gray' h={6} w={10}>
            <Center>
                <Text color="white">1x</Text>
            </Center>
        </Container>
    )
}

export const VolumeBar = observer(() => {
    const volume = uiStore.getVolume(); // Get current volume from UIStore

    const handleVolumeChange = (value: number) => {
        if (value > 0){
            uiStore.setMute(false);
        }
        uiStore.setVolume(value / 100); // Set volume in UIStore (assuming the slider value is 0-100)
    };

    const toggleMute = () => {
        uiStore.toggleMute();
    };

    let volumeIcon;
    if (uiStore.muted) {
        volumeIcon = <MdOutlineVolumeOff color="gray" size="2em" onClick={toggleMute}/>;
    }
    else if (volume > 0) {
        volumeIcon = <MdOutlineVolumeUp color="gray" size="2em" onClick={toggleMute}/>
    }
    else {
        volumeIcon = <MdOutlineVolumeOff color="gray" size="2em" onClick={toggleMute}/>
    }

    return (
        <HStack minW="5vw">
            {volumeIcon}
            <Slider
                aria-label='volume-slider'
                colorScheme='green'
                value={volume * 100} // Set the slider's value (assuming the volume is 0-1)
                onChange={handleVolumeChange} // Update volume on change
            >
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>
        </HStack>
    );
});

export function Maximizer() {
    return (
        <AiOutlineFullscreen color="gray" size="2em" />
    )
}

export const PlayerBar = observer(() => {
    const handlePlayPause = () => {
        uiStore.togglePlaying(); // Toggle between play and pause
    };

    const handleSkipNext = () => {
        uiStore.forwardFifteenSeconds(); // Skip forward 15 seconds
    };

    const handleSkipPrevious = () => {
        uiStore.backwardFifteenSeconds(); // Skip backward 15 seconds
    };

    const handleRepeatToggle = () => {
        uiStore.toggleLooping(); // Toggle repeat mode on or off
    };

    // Obtain the current play speed to display it correctly
    const playSpeed = uiStore.playSpeed;

    // You may need a method to cycle through the available play speeds
    const handleChangeSpeed = () => {
        uiStore.changePlaySpeed(); // Cycle to the next speed
    };

    // Update the icon depending on whether it's playing or not
    const playPauseIcon = uiStore.playing ? <FaPause color="white" size=".8em" onClick={handlePlayPause}/> : <FaPlay color="white" size=".8em" onClick={handlePlayPause}/>;
    const formattedSeekPosition = formatTime(uiStore.getSeekPosition());
    const formattedDuration = formatTime(uiStore.getDuration());
    return (
        <Center rounded={10} bg="Black" minH="20vh" minW="80vw">
            <HStack align="center">
                <VStack align="center">
                    <HStack>
                        <MdSkipPrevious color="gray" size="1.5em" onClick={handleSkipPrevious} />
                        {playPauseIcon}
                        <MdOutlineSkipNext color="gray" size="1.5em" onClick={handleSkipNext} />
                        <MdOutlineRepeat color={uiStore.looping ? "white" : "gray"} size="1.5em" onClick={handleRepeatToggle} />
                        <Container onClick={handleChangeSpeed} rounded={10} bg='gray' h={6} w={10}>
                            <Center>
                                <Text color="white">{playSpeed}x</Text>
                            </Center>
                        </Container>
                    </HStack>
                    <HStack alignItems="center">
                        <Text color="gray">{formattedSeekPosition}</Text>
                        <SeekBar />
                        <Text color="gray">{formattedDuration}</Text>
                    </HStack>
                </VStack>
                <GreenThresholdSlider />
                <VolumeBar />
                <Maximizer />
            </HStack>
        </Center>
    );
});