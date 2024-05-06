'use client';
import React from 'react';
import { Container, Heading, VStack, HStack, Text } from "@chakra-ui/react";
import { RecordingsStore } from "@/stores/RecordingStore";
import { observer } from 'mobx-react-lite';
import { EditorRow } from '@/components/transcript_editor_pane_components';

const HeadingInformationPane: React.FC<{ recording_store: RecordingsStore }> = observer(({ recording_store }) => {
    const current_recording = recording_store.getCurrentRecording();
    if (!current_recording) {
        return (
            <Heading size="md">This application is under development, please do not share, record or forward to anyone, this is meant for the recipient only</Heading>
        )
    }
    return (<div>
            <Heading size="lg">{current_recording && current_recording.title}</Heading>
            <HStack><Text size="sm">Transcribed by: </Text><Heading size="sm">{current_recording && current_recording.creator}</Heading></HStack>
            <HStack><Text size="sm">Description: </Text><Heading size="sm">{current_recording && current_recording.description}</Heading></HStack>
        </div>
    )
})

export const EditorPane: React.FC<{ recording_store: RecordingsStore }> = observer(({ recording_store }) => {
    const current_recording = recording_store.getCurrentRecording();
    return (
        <Container rounded={10} bg='white' minH="80vh" minW="70vw">
            <VStack align="center" direction="column" spacing={2} pt={4}>
                <Heading size="md" color="gray">Transcript Editor</Heading>
                <VStack bg='white' maxH="70vh" overflowY="auto" minW="60vw" align='left'>
                    <HeadingInformationPane recording_store={recording_store} />
                    {current_recording && current_recording.utterances.map((utterance, index) => (
                        <EditorRow
                            key={index}
                            utterance={utterance}
                            row_index={index}
                            updateSpeakerName={(index, newName, changeAll) => current_recording.updateSpeakerName(index, newName, changeAll)}
                        />
                    ))}
                </VStack>
            </VStack >
        </Container >
    );
});