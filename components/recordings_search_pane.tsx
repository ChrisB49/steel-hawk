import { Container, Text, Stack, VStack, Heading, Input, Button } from '@chakra-ui/react'
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { createRecordingObjectsFromDataJson, dataJsonFormat } from '@/app/lib/utilities';
import { useStore } from '@/app/providers';
import { Recording } from '@/stores/RecordingStore';

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
    const filteredData = recordingsStore.getRecordings().map((recording, index) => {
        return { id: index, title: recording.description || "Untitled", data: recording };
    });

    function handleClick(item: { id: number, title: string, data: dataJsonFormat | Recording }) {
        let recording_obj = null;
        if (item.data instanceof Recording) {
            recording_obj = item.data;
        }
        else {
            recording_obj = createRecordingObjectsFromDataJson(item.data);
            recordingsStore.addRecording(recording_obj);
        }
        recordingsStore.setCurrentRecording(recording_obj);
    }
    return (
        <Container rounded={10} bg='white' h='300px' w='100%'>
            <VStack align="center" direction="column" spacing={2}>
                <Heading size="md" color="gray">Search Results</Heading>
                <Container bg='white' w='100%' h='300px'>
                    <Stack>
                        {filteredData.map((item) => (
                            <Button onClick={() => handleClick(item)} key={item.id}>
                                <Text noOfLines={1} >{item.title}</Text>
                            </Button>
                        ))}
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