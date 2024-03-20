import { Container, Text, Stack, VStack, Heading, Input } from '@chakra-ui/react'
import { useState } from 'react';

export function TranscriptSearch({ onSearch }: { onSearch: (value: string) => void }) {
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

export function TranscriptSearchResults({ searchTerm }: { searchTerm: string }) {
    let dummy_data = [
        { id: 1, title: "This is a test1", data: [{}] },
        { id: 2, title: "This is a test2", data: [{}] },
        { id: 3, title: "This is a test3", data: [{}] },
        { id: 4, title: "This is a test4", data: [{}] },
    ]
    const filteredData = dummy_data.filter(item => item.title.includes(searchTerm));
    return (
        <Container rounded={10} bg='white' h='300px' w='100%'>
            <VStack align="center" direction="column" spacing={2}>
                <Heading size="md" color="gray">Search Results</Heading>
                <Container bg='white' w='100%' h='300px'>
                    <Stack>
                        {filteredData.map((item) => (
                            <Text key={item.id}>{item.title}</Text>
                        ))}
                    </Stack>
                </Container>
            </VStack>
        </Container>
    )
}

export function Transcript() {
    const [searchTerm, setSearchTerm] = useState('');
    return (
        <Container rounded={10} bg='white' w='100%' h='80vh'>
            <VStack justify="space-evenly" align="center" direction="column" py={5} spacing={2}>
                <Heading>Transcripts</Heading>
                <TranscriptSearch onSearch={setSearchTerm} />
                <Container bg='white'>
                    <TranscriptSearchResults searchTerm={searchTerm} />
                </Container>
            </VStack>
        </Container>
    )
}