import React, { useContext, createContext } from 'react';
import { Container, Heading, VStack, Text } from "@chakra-ui/react";
import { Recording, RecordingsStore } from "@/stores/RecordingStore";
import { useStore } from '@/app/providers';
import { observer } from 'mobx-react-lite';
import { getOrSetDefaultRecordings } from '@/app/lib/utilities';

export const EditorPane: React.FC<{ recording_store: RecordingsStore }> = observer(({ recording_store }) => {
    const current_recording = recording_store.getCurrentRecording();
    return (
        <Container rounded={10} bg='white' minH="80vh" minW="70vw">
            <VStack align="center" direction="column" spacing={2} pt={4}>
                <Heading size="md" color="gray">Transcript Editor</Heading>
                <Container bg='white' maxH="70vh" w='full' overflowY="auto" minW="60vw">
                    <Heading size="sm">{current_recording && current_recording.description}</Heading>
                    {current_recording && current_recording.utterances.map((utterance, index) => (
                        <Text key={index}>{utterance.utterance}</Text>
                    ))}
                </Container>
            </VStack >
        </Container >
    );
});