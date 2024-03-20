import { Container, Heading, VStack, Text } from "@chakra-ui/react";

export function EditorPane() {
    return (
        <Container rounded={10} bg='white' minW='80vw' minH="80vh">
            <VStack align="center" direction="column" spacing={2} pt={4}>
                <Heading size="md" color="gray">Transcript Editor</Heading>
                <Container bg='white' h={400} w='full'>
                    <Text>Transcription Contents Go Here</Text>
                </Container>
            </VStack>
        </Container>
    )
}