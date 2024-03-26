import React, { useContext, createContext } from 'react';
import { Container, Heading, VStack, Text, HStack } from "@chakra-ui/react";
import { Recording, RecordingsStore } from "@/stores/RecordingStore";
import { useStore } from '@/app/providers';
import { observer } from 'mobx-react-lite';
import { EditorRow } from '@/components/transcript_editor_pane_components';

export const EditorPane: React.FC<{ recording_store: RecordingsStore }> = observer(({ recording_store }) => {
    const current_recording = recording_store.getCurrentRecording();
    return (
        <Container rounded={10} bg='white' minH="80vh" minW="70vw">
            <VStack align="center" direction="column" spacing={2} pt={4}>
                <Heading size="md" color="gray">Transcript Editor</Heading>
                <VStack bg='white' maxH="70vh" overflowY="auto" minW="60vw" align='left'>
                    <Heading size="sm">{current_recording && current_recording.description}</Heading>
                    {current_recording && current_recording.utterances.map((utterance, index) => (
                        <EditorRow utterance={utterance} row_index={index}></EditorRow>
                    ))}
                </VStack>
            </VStack >
        </Container >
    );
});