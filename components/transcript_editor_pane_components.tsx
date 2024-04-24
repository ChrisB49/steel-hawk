import { Container, Heading, Text, HStack, Wrap, WrapItem, Box,Editable,
    EditableInput,
    EditableTextarea,
    EditablePreview, } from "@chakra-ui/react";
import { Utterance, Word } from "@/stores/RecordingStore";
import { MdEditSquare, MdCheck  } from "react-icons/md";
import { observer } from 'mobx-react-lite';
import { uiStore } from '@/stores/UIStore';
import { useEffect, useRef } from "react";


export const EditorWord: React.FC<{ word: Word, index: number, isHighlighted: boolean, row_index: number }> = observer(({ word, index, isHighlighted, row_index }) => {

    function calculateColor(word: Word) {
        // Ensure confidence is within the expected range
        let confidence = Math.max(0, Math.min(1, word.getConfidence()));
        let threshold = uiStore.getConfidenceDisplayThreshold();
        if (confidence >= threshold) {
            // For confidence 0.85 and above, return no color
            return [`rgba(0, 0, 0, 0)`, `rgba(0, 0, 0, 0)`]; // Transparent color
        }

        let r, g;

        if (confidence < 0.7) {
            // For confidence below 0.7, increase red component and decrease green linearly
            r = 255; // Keep red at maximum
            g = Math.floor(255 * (confidence / 0.7)); // Scale green based on confidence, maxing out at 0.7
        } else {
            // For confidence 0.7 and above, scale both towards green, with green maxing out and red decreasing
            r = Math.floor(255 * (1 - ((confidence - 0.7) / 0.3))); // Decrease red as confidence goes from 0.7 to 1.0
            g = 255; // Keep green at maximum for any confidence >= 0.7
        }

        // Return both the solid and transparent versions of the color
        return [`rgba(${r}, ${g}, 0, 1)`, `rgba(${r}, ${g}, 0, 0)`]; // Solid color and transparent color
    }
    let [solidColor, transparentColor] = calculateColor(word);

    // Define the gradient from transparent -> solid -> transparent
    let gradient_radial = `radial-gradient(ellipse, ${solidColor} 50%, ${transparentColor} 100%)`;
    
    const handleClick = (e: { detail: any; }) => {
        switch (e.detail) {
          case 1:
            console.log("click");
            uiStore.userInitiatedSeek(word.start / 1000)
            break;
          case 2:
            console.log("double click");
            uiStore.startEditingWord(row_index, index);
            break;
          case 3:
            console.log("triple click");
            break;
        }
      };
      

    const currentEditingWord = uiStore.getEditingWord();
    if (currentEditingWord && currentEditingWord[0] === row_index && currentEditingWord[1] === index) {
        return (
        <Editable defaultValue={word.text} onSubmit={() => { uiStore.stopEditingWord() }}>
            <EditablePreview />
            <EditableInput />
        </Editable>
        );
    }
    else {
        return (
            <Box onClick={handleClick} rounded={10} p={1} bgGradient={gradient_radial} border={isHighlighted ? '2px solid blue' : 'none'}>
                <Text>{word.getText()}</Text>
            </Box>
        )
    }
});

export const EditorRowContents: React.FC<{ utterance: Utterance, row_index: number, isEditing: boolean }> = observer(({ utterance, row_index, isEditing }) => {
    if (isEditing) {
        return (
            <Editable defaultValue={utterance.utterance} onSubmit={() => { uiStore.stopEditingRow() }}>
                <EditablePreview />
                <EditableTextarea />
            </Editable>
        )
    }
    else {
        return (
            <Wrap>
                {utterance.words && utterance.words.map((word, index) => (
                    <WrapItem key={index}>
                        <EditorWord word={word} index={index} row_index={row_index} isHighlighted={word.getHighlighted()}></EditorWord>
                    </WrapItem>
                ))}
            </Wrap>
        )
    }
});


export const EditRowIcon: React.FC<{ isEditing: boolean, row_index: number }> = observer(({ isEditing, row_index }) => {
    const editRow = (e: { detail: any }) => {
        if (uiStore.getEditingRow() === row_index) {
            uiStore.stopEditingRow();
        }
        else {
            uiStore.startEditingRow(row_index);
        }
    }


    if (isEditing) {
        return (
            <MdCheck onClick={editRow}/>
        )
    }
    else {
        return (
            <MdEditSquare onClick={editRow}/>
        )
    }
});


export const EditorRow: React.FC<{ utterance: Utterance, row_index: number }> = observer(({ utterance, row_index }) => {
    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('Effect run for row:', row_index, 'Focused:', utterance.getFocused(), "ref:", rowRef.current);
        if (utterance.getFocused() && rowRef.current) {
            console.log('Scrolling into view:', row_index);
            rowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [utterance.focused]);

    
    const isEditing = uiStore.getEditingRow() === row_index

    return (
        <div ref={rowRef}> {/* Ensure that the ref is attached to the DOM element */}
            <HStack align="center" key={row_index}>
                <Text color="gray" fontSize={10}>{(utterance.start / 1000).toFixed(1)}s - {(utterance.end / 1000).toFixed(1)}s</Text>
                <EditRowIcon isEditing={isEditing} row_index={row_index}/>
                <Container bg="gray.50" minW="90%" minH="auto" p={2} m={1} rounded={10} border="2px" borderColor="black">
                    <Heading size="sm">{utterance.speaker}</Heading>
                    <EditorRowContents utterance={utterance} row_index={row_index} isEditing={isEditing}/>
                </Container>
            </HStack>
        </div>
    );
});