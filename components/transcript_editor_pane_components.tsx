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
    Spacer,
    VStack, } from "@chakra-ui/react";
import { Recording, Utterance, Word } from "@/stores/RecordingStore";
import { MdEditSquare, MdCheck  } from "react-icons/md";
import { observer } from 'mobx-react-lite';
import { uiStore } from '@/stores/UIStore';
import { useEffect, useRef, useState } from "react";
import { toJS } from "mobx";


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
        //print the words in the utterance
        console.log("Utterance words: ", toJS(utterance.words));
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

const EditUtteranceTypeModal: React.FC<{
    initialType: string;
    onSave: (newType: string) => void;
    onClose: () => void;
  }> = ({ initialType, onSave, onClose }) => {
    const [selectedType, setSelectedType] = useState(initialType.toLowerCase());
  
    useEffect(() => {
      setSelectedType(initialType.toLowerCase());
    }, [initialType]);
  
    return (
      <Modal isOpen={true} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Utterance Type</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={0}> {/* Set spacing to 0 to have buttons touch each other */}
              {['Question', 'Answer', 'Colloquy'].map((type) => (
                <Button
                  key={type}
                  colorScheme={selectedType === type.toLowerCase() ? 'blue' : 'gray'}
                  variant={selectedType === type.toLowerCase() ? 'solid' : 'outline'}
                  onClick={() => onSave(type)}
                  isDisabled={selectedType === type.toLowerCase()}
                  _disabled={{
                    bg: 'blue.300',
                    color: 'white',
                    cursor: 'not-allowed',
                  }}
                  width="100%"
                >
                  {type}
                </Button>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
interface CommandBarProps {
    current_recording: Recording;
}

export const CommandBar: React.FC<CommandBarProps> = observer(({current_recording}) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        if (!current_recording) {
          console.error("No recording selected");
          return;
        }
      
        const { json_file_name, jsonContent } = current_recording.generateJSONFile(); // Generate JSON file content
        
        try {
          // Request a presigned PUT URL from your server
          const presignedUrlResponse = await fetch('/api/s3/create-presigned-urls', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: json_file_name }),
          });
      
          if (!presignedUrlResponse.ok) {
            throw new Error(`HTTP error! status: ${presignedUrlResponse.status}`);
          }
      
          const { signedPutUrlObject } = await presignedUrlResponse.json(); // Extract the presigned PUT URL
      
          // Use the presigned PUT URL to upload the file directly from the client
          const uploadResponse = await fetch(signedPutUrlObject, {
            method: 'PUT',
            body: new Blob([jsonContent], { type: 'application/json' }), // The actual JSON blob to be uploaded
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          if (!uploadResponse.ok) {
            throw new Error(`HTTP error! status: ${uploadResponse.status}`);
          }
      
          console.log("File saved successfully");
          setIsSaving(false);
        } catch (error) {
          console.error("Error saving file:", error);
          setIsSaving(false);
        }
      };

    useEffect(() => {
        const autoSaveInterval = uiStore.getAutoSaveStatus() ? setInterval(handleSave, 60000) : null;

        return () => {
            if (autoSaveInterval) clearInterval(autoSaveInterval);
        };
    }, [uiStore.getAutoSaveStatus()]);

    const isAutoSaveActive = uiStore.getAutoSaveStatus();

    function deleteRecording() {
        console.log("Delete");
    }

    return (
        <HStack>
            <Button
                size="sm"
                colorScheme="blue"
                isActive={isAutoSaveActive}
                isLoading={isSaving}
                onClick={() => uiStore.toggleAutoSave()}
                loadingText="Saving...">
                Autosave
            </Button>
            <Button size="sm" colorScheme="blue" onClick={handleSave} isLoading={isSaving} loadingText="Saving...">Save</Button>
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
    updateUtteranceType: (index: number, newType: string) => void;
  }


export const EditorRow: React.FC<EditorRowProps> = observer(({ utterance, row_index, updateSpeakerName, updateUtteranceType }) => {    
    const rowRef = useRef<HTMLDivElement>(null);
    const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEditUtteranceTypeModal, setShowEditUtteranceTypeModal] = useState(false);
    const [currentUtteranceType, setCurrentUtteranceType] = useState('');

    const openUtteranceTypeEditModal = (utteranceType: string) => {
    setCurrentUtteranceType(utteranceType);
    setShowEditUtteranceTypeModal(true);
    };

    const closeUtteranceTypeEditModal = () => {
    setShowEditUtteranceTypeModal(false);
    };

    const saveUtteranceType = (newType: string) => {
    // Implement the logic to save the new utterance type to your data model here
    updateUtteranceType(row_index, newType.toLowerCase());
    closeUtteranceTypeEditModal();
    };

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
    

    const handleClickSpeaker = (e: { detail: any; }) => {
        console.log("click");
    };

    const handleMouseDownSpeaker = () => {
        const timer = setTimeout(() => {
            console.log("Detected hold, triggering edit mode for speaker");
            openModal();
        }, 300); // Set the hold duration to 300ms
        setHoldTimer(timer);
    };

    // Function to clear the hold event timer
    const handleMouseUpSpeaker = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            setHoldTimer(null);
        }
    };

    const convertSecondsToTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedSeconds = remainingSeconds % 1 === 0 ? remainingSeconds : remainingSeconds.toFixed(2);
        return `${minutes}:${formattedSeconds.toString() < '10' ? '0' : ''}${formattedSeconds}`;
    }

    const handleMouseDownUtteranceType = (utteranceType: string) => {
        const timer = setTimeout(() => {
            console.log("Detected hold, triggering edit mode for utterance type");
            openUtteranceTypeEditModal(utteranceType); // You'll need to implement this function
        }, 300); // Set the hold duration to 300ms
        setHoldTimer(timer); // You'll need to manage a holdTimer state
        };
          
        const handleMouseUpUtteranceType = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            setHoldTimer(null);
        }
        };

    
    const isEditingRow = uiStore.getEditingRow() === row_index;

    return (
        <div ref={rowRef}> {/* Ensure that the ref is attached to the DOM element */}
            <HStack align="center" key={row_index}>
                <Text color="gray" fontSize={10}>{convertSecondsToTime(utterance.start / 1000)} - {convertSecondsToTime(utterance.end / 1000)}</Text>
                <Spacer />
                <EditRowIcon isEditing={isEditingRow} row_index={row_index}/>
                <Container bg="gray.50" minW="90%" minH="auto" p={2} m={1} rounded={10} border="2px" borderColor="black">
                        <HStack align="center" justify="left">
                            <Heading 
                                size="sm" 
                                onMouseDown={handleMouseDownSpeaker} 
                                onMouseUp={handleMouseUpSpeaker} 
                                onMouseLeave={handleMouseUpSpeaker} 
                                onClick={handleClickSpeaker}
                            >
                                {utterance.speaker}
                            </Heading>
                            <Heading>
                                <Text 
                                    fontSize="10px" 
                                    color="gray.500" 
                                    onMouseDown={() => handleMouseDownUtteranceType(utterance.type)}
                                    onMouseUp={handleMouseUpUtteranceType}
                                    onMouseLeave={handleMouseUpUtteranceType}
                                >- {utterance.type}
                                </Text>
                            </Heading>
                        </HStack>
                        {showEditModal && (
                            <EditSpeakerModal
                                initialSpeakerName={utterance.speaker}
                                onSave={handleSpeakerNameChange}
                                onClose={closeModal}
                            />
                        )}
                        {showEditUtteranceTypeModal && (
                            <EditUtteranceTypeModal
                                initialType={currentUtteranceType}
                                onSave={saveUtteranceType}
                                onClose={closeUtteranceTypeEditModal}
                            />
                        )}
                    <EditorRowContents utterance={utterance} row_index={row_index} isEditing={isEditingRow}/>
                </Container>
            </HStack>
        </div>
    );
});