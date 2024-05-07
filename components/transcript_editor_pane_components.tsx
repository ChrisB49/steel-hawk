import { Container, Heading, Text, HStack, Wrap, WrapItem, Box,Editable,
    EditableInput,
    EditableTextarea,
    EditablePreview,
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Spacer, } from "@chakra-ui/react";
import { Recording, Utterance, Word } from "@/stores/RecordingStore";
import { MdEditSquare, MdCheck  } from "react-icons/md";
import { observer } from 'mobx-react-lite';
import { uiStore } from '@/stores/UIStore';
import { useEffect, useRef, useState } from "react";


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
    if (currentEditingWord && currentEditingWord[0] === row_index) {
        if (currentEditingWord[1] === index) {
            return (
            <Editable defaultValue={word.text} onSubmit={() => { uiStore.stopEditingWord() }}>
                <EditablePreview />
                <EditableInput />
            </Editable>
            );
        }
    }
    return (
        <Box onClick={handleClick} rounded={10} p={1} bgGradient={gradient_radial} border={isHighlighted ? '2px solid blue' : 'none'}>
            <Text>{word.getText()}</Text>
        </Box>
    )
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

interface EditSpeakerModalProps {
    initialSpeakerName: string;
    onSave: (newName: string, changeAll: boolean) => void;
    onClose: () => void;
  }

  const EditSpeakerModal: React.FC<EditSpeakerModalProps> = ({ initialSpeakerName, onSave, onClose }) => {
    const [speakerName, setSpeakerName] = useState(initialSpeakerName);

    return (
        <Modal isOpen={true} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Speaker Name</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Input
                        value={speakerName}
                        onChange={(e) => setSpeakerName(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <HStack>
                        <Button colorScheme="blue" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={() => onSave(speakerName, false)}>
                            Change This One
                        </Button>
                        <Button colorScheme="blue" onClick={() => onSave(speakerName, true)}>
                            Change All
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

interface CommandBarProps {
    current_recording: Recording;
}

export const CommandBar: React.FC<CommandBarProps> = observer(({current_recording}) => {
    const isAutoSaveActive = uiStore.getAutoSaveStatus();
    function manualSave() {
        console.log("Saving...");
    }

    function deleteRecording() {
        console.log("Delete");
    }

    function undoAction() {
        console.log("Undo");
    }

    function redoAction() {
        console.log("Redo");
    }
    return (
        <HStack>
            <Button
                size="sm"
                colorScheme="blue"
                isActive={isAutoSaveActive}
                onClick={() => uiStore.toggleAutoSave()}
            >
                Autosave
            </Button>
            <Button size="sm" colorScheme="blue" onClick={manualSave}>Save</Button>
            <Button size="sm" colorScheme="gray" onClick={() => uiStore.handleUndo(current_recording)} isDisabled={!uiStore.canUndo(current_recording)}>Undo</Button>
            <Button size="sm" colorScheme="gray" onClick={() => uiStore.handleRedo(current_recording)} isDisabled={!uiStore.canRedo(current_recording)}>Redo</Button>
            <Spacer />
            
            <Button size="sm" colorScheme="red" onClick={deleteRecording}>Delete</Button>
        </HStack>
    )
});

interface EditorRowProps {
    utterance: Utterance;
    row_index: number;
    updateSpeakerName: (index: number, newName: string, changeAll: boolean) => void;
  }


export const EditorRow: React.FC<EditorRowProps> = observer(({ utterance, row_index, updateSpeakerName }) => {    
    const rowRef = useRef<HTMLDivElement>(null);
    const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (utterance.getFocused() && rowRef.current) {
            rowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [utterance.focused]);


    const openModal = () => {
        setShowEditModal(true);
    };
    
    // Function to close the modal
    const closeModal = () => {
        setShowEditModal(false);
    };

    const handleSpeakerNameChange = (newName: string, changeAll: boolean) => {
        updateSpeakerName(row_index, newName, changeAll);
        closeModal();
    };
    

    const handleClick = (e: { detail: any; }) => {
        console.log("click");
    };

    const handleMouseDown = () => {
        const timer = setTimeout(() => {
            console.log("Detected hold, triggering edit mode for speaker");
            openModal();
        }, 300); // Set the hold duration to 300ms
        setHoldTimer(timer);
    };

    // Function to clear the hold event timer
    const handleMouseUp = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            setHoldTimer(null);
        }
    };

    
    const isEditingRow = uiStore.getEditingRow() === row_index;

    return (
        <div ref={rowRef}> {/* Ensure that the ref is attached to the DOM element */}
            <HStack align="center" key={row_index}>
                <Text color="gray" fontSize={10}>{(utterance.start / 1000).toFixed(1)}s - {(utterance.end / 1000).toFixed(1)}s</Text>
                <EditRowIcon isEditing={isEditingRow} row_index={row_index}/>
                <Container bg="gray.50" minW="90%" minH="auto" p={2} m={1} rounded={10} border="2px" borderColor="black">
                        <Heading 
                            size="sm" 
                            onMouseDown={handleMouseDown} 
                            onMouseUp={handleMouseUp} 
                            onMouseLeave={handleMouseUp} 
                            onClick={handleClick}
                        >
                            {utterance.speaker}
                        </Heading>
                        {showEditModal && (
                            <EditSpeakerModal
                                initialSpeakerName={utterance.speaker}
                                onSave={handleSpeakerNameChange}
                                onClose={closeModal}
                            />
                        )}
                    <EditorRowContents utterance={utterance} row_index={row_index} isEditing={isEditingRow}/>
                </Container>
            </HStack>
        </div>
    );
});