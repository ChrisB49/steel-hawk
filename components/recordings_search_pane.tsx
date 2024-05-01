'use client';
import { Container, Text, Stack, VStack, Heading, Input, Button, useToast } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '@/app/providers';
import { Recording } from '@/stores/RecordingStore';
import { uiStore } from '@/stores/UIStore';
import { createRecordingObjectFromS3JSONData } from '@/app/lib/utilities';

export async function retrieve_one_more_recording(currently_loaded_recordings: Recording[]): Promise<Recording|null> {
    //only put the loaded recordings file names in the excluded list
    let excluding_str = '['
    for (let i = 0; i < currently_loaded_recordings.length; i++) {
        let json_file_name = "";
        if (currently_loaded_recordings[i].audio.isNammuS3AudioSource()) {
            //if the recording audio source is S3 based, we will name the JSON recording file the same name as the audio file it relates to
            json_file_name = currently_loaded_recordings[i].audio.getRawAudioUrl().split('/')[currently_loaded_recordings[i].audio.getRawAudioUrl().split('/').length - 1];
            json_file_name = json_file_name.split('.')[0] + ".json";
        }
        else {
            //otherwise we will name the JSON recording file with the same id of the AssemblyAI transcription id
            json_file_name = currently_loaded_recordings[i].transcription.assemblyAITranscriptID + '.json';
        }
        excluding_str += json_file_name
    }
    excluding_str += ']'
    console.log(excluding_str)
    let url = '/api/s3/get-saved-transcripts';
    if (excluding_str !== '[]') {
        url += '?excluding=' + excluding_str
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    //if 404, return null
    if (response.status === 404) {
        return null
    }
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const data_obj = JSON.parse(JSON.parse(text));
    console.log("number of utterances in most recent file:", data_obj.utterances.length);
    
    // Assuming the JSON file has the structure needed to create a Recording object.
    const newly_loaded_recording = createRecordingObjectFromS3JSONData(data_obj);
    return newly_loaded_recording;
}

export function RecordingSearch({ onSearch }: { onSearch: (value: string) => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        onSearch(event.target.value);
    }

    return (
        <Container>
            <Input
                variant='outline'
                placeholder='Search Transcripts'
                border="2px"
                borderColor="black"
                value={searchTerm}
                type="search"
                onChange={handleSearch}
            />
        </Container >
    )
}

export const RecordingSearchResults: React.FC<{ searchTerm: string }> = observer(({ searchTerm }) => {
    const recordingsStore = useStore().recordingsStore;
    const [loading, setLoading] = useState(false);
    const filteredData = recordingsStore.getRecordings().map((recording, index) => {
        return { id: index, title: recording.title || "Untitled", data: recording };
    });
    const toast = useToast();

    async function handleClick(item: { id: number, title: string, data: Recording }) {
        let recording_obj = null;
        recording_obj = item.data;
        uiStore.resetUIState();
        await recordingsStore.setCurrentRecording(recording_obj);
    }

    const loadMoreRecordings = async () => {
        try {
            setLoading(true);
            const newRecording = await retrieve_one_more_recording(recordingsStore.getRecordings());
            // Update your recordings list with the newRecording...
            if (newRecording) {
                recordingsStore.addRecording(newRecording);
                console.log('Recordings updated:', recordingsStore.getRecordings());
            } else {
                toast({
                    title: "Not Found",
                    description: "No more transcripts available to load",
                    status: "info",
                    duration: 5000,
                    isClosable: true,
                  });
            }
        } catch (error) {
            // Handle error...
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container rounded={10} bg='white' h='300px' w='100%'>
            <VStack align="center" direction="column" spacing={2}>
                <Heading size="md" color="gray">Search Results</Heading>
                <Container bg='white' w='100%' h='250px' overflowY="auto">
                    <Stack>
                        {filteredData.map((item) => (
                            <Button onClick={() => handleClick(item)} key={item.id}>
                                <Text noOfLines={1}>{item.title}</Text>
                            </Button>
                        ))}
                        {loading ? (
                            <Button isLoading loadingText="Loading...">
                                Load More
                            </Button>
                        ) : (
                            <Button onClick={loadMoreRecordings}>
                                Load More
                            </Button>
                        )}
                    </Stack>
                </Container>
            </VStack>
        </Container>
    );
});

export function RecordingPane() {
    const [searchTerm, setSearchTerm] = useState('');
    return (
        <Container rounded={10} bg='white' w='100%' h='80vh'>
            <VStack justify="space-evenly" align="center" direction="column" py={5} spacing={2}>
                <Heading>Transcripts</Heading>
                <RecordingSearch onSearch={setSearchTerm} />
                <Container bg='white'>
                    <RecordingSearchResults searchTerm={searchTerm} />
                </Container>
            </VStack>
        </Container>
    )
}