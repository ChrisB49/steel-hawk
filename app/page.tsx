'use client'
import { Container, Flex, Text, Link, Stack, VStack, HStack, Heading, } from '@chakra-ui/react'
import dynamic from 'next/dynamic';

import { RecordingPane } from "@/components/recordings_search_pane";
import { UtilityMenu } from '@/components/utility_menu';
import { PlayerBar } from '@/components/audio_controls';
import { EditorPane } from '@/components/transcript_editor';import { RecordingsStore, Recording, Audio, Transcript, Utterance } from '@/stores/RecordingStore';
import { useGetOrSetDefaultRecordings } from '@/app/lib/utilities';
import { useStore } from '@/app/providers';
import { AudioPlayer } from '@/components/audio';


const AudioPlayerNoSSR = dynamic(() => import('@/components/audio').then(mod => mod.AudioPlayer), {
    ssr: false,
  });
export default function Page() {
    const recordingsStore = useStore().recordingsStore;
    recordingsStore.setCurrentRecording(useGetOrSetDefaultRecordings());
    return (
        <Container bg="black" minWidth="100%" minHeight="100vh">
            <AudioPlayerNoSSR />
            <VStack>
                <HStack align="top" spacing={3}>
                    <VStack align="left" direction="column" pt={3} minW='15vw' minH='80vh'>
                        <RecordingPane />
                    </VStack>
                    <VStack pt={3} minH='80vh'>
                        <EditorPane recording_store={recordingsStore} />
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
