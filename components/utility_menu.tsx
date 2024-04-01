'use client'
import { FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Button, useToast, Container, Link, VStack, HStack, Image, FormHelperText, Select, Heading } from '@chakra-ui/react'
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import https from "https";
import { useDisclosure } from '@chakra-ui/hooks';
import React from 'react';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { uiStore } from '@/stores/UIStore';

const SSEListenerComponent = observer(() => {
    useEffect(() => {
      if (!uiStore.transcriptionId) return;
  
      const eventSource = new EventSource(`/api/updates?transcriptionId=${uiStore.transcriptionId}`);
  
      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data);
  
        if (data.status === 'TranscriptionCompleted' && data.transcriptionId === uiStore.transcriptionId) {
          uiStore.completeTranscription();
        }
      };
  
      eventSource.onerror = (e) => {
        console.error('EventSource failed:', e);
        eventSource.close();
      };
  
      return () => {
        eventSource.close();
      };
    }, [uiStore, uiStore.transcriptionId]);
  
    // Render your component UI here
    return (
      <div>
        {uiStore.isTranscribing ? (
            <Button colorScheme="blue" size="md" w='35vh' isLoading loadingText='Transcribing... Please wait.'></Button>
        ) : null}
      </div>
    );
  });
  
  export default SSEListenerComponent;

export const NewTranscriptionButton = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [audioSource, setAudioSource] = React.useState('file');
    const toast = useToast();

    async function uploadToPresignedUrl(url: string, data: Blob) {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                body: data, // Blob data
                headers: {
                    'Content-Type': 'application/octet-stream', // or the appropriate type for your file
                },
            });
    
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
    
            return await response.text(); // or .json() if the response is in JSON format
        } catch (error) {
            console.error('Upload to presigned URL failed:', error);
            throw error;
        }
    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const file = formData.get('file_Input');
    
        if (file && file instanceof File) {
            try {
                // Send only the filename to your API
                const response = await fetch('/api/s3/create-presigned-urls', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filename: file.name }),
                });
    
                if (response.ok) {
                    const { signedPutUrlObject,signedGetUrlObject } = await response.json();
                    // Perform the upload directly to the presignedURL
                    const uploadResponse = await uploadToPresignedUrl(signedPutUrlObject, file);
                    //start transcription via assemblyAI
                    const resp = await fetch('/api/assemblyAI/start_transcription', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ s3presignedurl: signedGetUrlObject }),
                    });
                    const resp_json = await resp.json(); 
                    uiStore.startTranscription(resp_json.data.id);
                    // Handle successful upload response here
                    console.log('File uploaded successfully:', uploadResponse);
                    toast({
                        title: "Transcription Added",
                        description: "Transcription Added successfully, Processing now...",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                } else {
                    throw new Error('Failed to get presigned URL');
                }
            } catch (error) {
                console.error('Error:', error);
                // Handle the error
            }
        }
        onClose();
    }

    return (
        <>
            <Button leftIcon={<AddIcon />} colorScheme="blue" size="md" w='35vh' onClick={onOpen}>New Transcription</Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create new Transcription</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <form 
                        id="create-form"
                        onSubmit={handleSubmit}>
                            <FormControl>
                                <FormLabel>Title</FormLabel>
                                <FormHelperText>Enter a title for your transcription</FormHelperText>
                                <Input name="title" placeholder="Title" />
                            </FormControl>
                            <FormControl mt={4}>
                                <FormLabel>Description</FormLabel>
                                <FormHelperText>Enter a description for your transcription. This should be pretty short, typically just the case number</FormHelperText>
                                <Input name="description" placeholder="Description" /> 
                            </FormControl>
                            <FormControl mt={4}>
                                <FormLabel>Number of Speakers</FormLabel>
                                <Input type="number" name="number_of_speakers" placeholder="Enter the number of speakers" />
                                </FormControl>
                                <FormControl mt={4}>
                                    <FormLabel>Audio Source</FormLabel>
                                    <Select name="audio_source" onChange={(e) => setAudioSource(e.target.value)}>
                                        <option value="file">File Upload</option>
                                        <option value="url">URL</option>
                                    </Select>
                                </FormControl>
                                {audioSource === 'file' && (
                                    <FormControl mt={4}>
                                        <FormLabel>Upload Audio File</FormLabel>
                                        <Input type="file" name="file_Input" accept=".3ga,.8svx,.aac,.ac3,.aif,.aiff,.alac,.amr,.ape,.au,.dss,.flac,.flv,.m4a,.m4b,.m4p,.m4r,.mp3,.mpga,.ogg,.oga,.mogg,.opus,.qcp,.tta,.voc,.wav,.wma,.wv" />
                                    </FormControl>
                                )}
                                {audioSource === 'url' && (
                                    <FormControl mt={4}>
                                        <FormLabel>Audio URL</FormLabel>
                                        <Input type="url" name="audio_url" placeholder="Enter the URL of the audio file" />
                                    </FormControl>
                                )}
                        </form>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} type="submit" form="create-form">
                            Create
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}



export const UtilityMenu = observer(() => {
    // Render the SSEListenerComponent if a transcription is occurring
    const transcriptionStatus = uiStore.isTranscribing ? (
      <SSEListenerComponent />
    ) : (
      <NewTranscriptionButton />
    );
  
    return (
      <Container rounded={10} bg='black'>
        <HStack align="center" direction="column" spacing={2}>
          <Image src="static/img/nammu_logo_inverted.png" alt="Logo" w="150px" h="150px" />
          <VStack>
            {transcriptionStatus}
            <Button leftIcon={<EditIcon />} colorScheme="blue" size="md" w='35vh'>
              <Link href='/'>Format/Export</Link>
            </Button>
          </VStack>
        </HStack>
      </Container>
    );
  });