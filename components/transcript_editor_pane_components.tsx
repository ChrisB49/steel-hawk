import React, { useContext, createContext } from 'react';
import { Container, Heading, VStack, Text, HStack, Wrap, WrapItem, Box } from "@chakra-ui/react";
import { Recording, RecordingsStore, Utterance, Word } from "@/stores/RecordingStore";
import { useStore } from '@/app/providers';
import { observer } from 'mobx-react-lite';
import { uiStore } from '@/stores/UIStore';


export const EditorWord: React.FC<{ word: Word }> = observer(({ word }) => {

    function calculateColor(word: Word) {
        let confidence = Math.max(0, Math.min(1, word.getConfidence()));
        let r, g;

        if (confidence < 0.7) {
            r = 255;
            g = Math.floor(255 * (confidence / 0.7));
        } else {
            r = Math.floor(255 * (1 - ((confidence - 0.7) / 0.3)));
            g = 255;
        }

        let solidColor = `rgba(${r}, ${g}, 0, 1)`;
        let transparentColor = `rgba(${r}, ${g}, 0, 0)`;
        let [rValue, gValue] = solidColor.match(/\d+/g)?.map(Number) ?? [0, 0];


        // Directly access uiStore.greenThreshold here
        let gradient_radial;
        if (gValue >= uiStore.greenThreshold && rValue < 100) {
            gradient_radial = "";
        } else {
            console.log("gValue: ", gValue, "rValue: ", rValue, "uiStore.greenThreshold: ", uiStore.greenThreshold)
            gradient_radial = `radial-gradient(circle, ${solidColor} 50%, ${transparentColor} 100%)`;
        }

        return gradient_radial;
    }
    let gradient = calculateColor(word);

    return (
        <Box rounded={10} p={1} bgGradient={gradient}>
            <Text>{word.getText()}</Text>
        </Box>
    );
});


export const EditorRow: React.FC<{ utterance: Utterance, row_index: number }> = observer(({ utterance, row_index }) => {


    return (
        <HStack align="center">
            <Text color="gray" fontSize={10}>{(utterance.start / 1000).toFixed(1)}s - {(utterance.end / 1000).toFixed(1)}s</Text>
            <Container key={row_index} bg="gray.50" minW="90%" minH="auto" p={2} m={1} rounded={10} border="2px" borderColor="black">
                <Heading size="sm">{utterance.speaker}</Heading>
                <Wrap>
                    {utterance.words && utterance.words.map((word, index) => (
                        <WrapItem key={index}>
                            <EditorWord word={word}></EditorWord>
                        </WrapItem>
                    ))}
                </Wrap>
            </Container>
        </HStack>
    );
});