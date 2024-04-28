'use client'
import { FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Button, useToast, Container, Link, VStack, HStack, Image, FormHelperText, Select, Heading, Progress } from '@chakra-ui/react'
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { useDisclosure } from '@chakra-ui/hooks';
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { uiStore } from '@/stores/UIStore';
import { useStore } from '@/app/providers';
import { RecordingsStore } from "@/stores/RecordingStore";

export const UploadProgress = observer(() => {
    if (!uiStore.newTranscription.isUploading) {
      return null;
    }
    const button_text = `Uploading... ${uiStore.newTranscription.uploadingPercentage.toFixed(2)}%`;
    
    return (
      <Button colorScheme="blue" size="md" w='35vh' isLoading loadingText={button_text}></Button>
    );
  });

  export const PollingComponent = ({ transactionId, recordingsStore }: { transactionId: string, recordingsStore: RecordingsStore }) => {
    const toast = useToast();
    const [isPolling, setIsPolling] = useState(true);
    useEffect(() => {
      if (transactionId === "") {
        setIsPolling(false);
        return;
      }
      const intervalId = setInterval(async () => {
        if (uiStore.newTranscription.isTranscribing) {
          try {
            console.log('Checking transcription status...');
            const response = await fetch(`/api/assemblyAI/get-status?transactionId=${transactionId}`);
            if (response.ok) {
                const { status,data } = await response.json();
                let formData = uiStore.newTranscription.getFields();
                if (formData["description"] !== "") {
                  data['summary'] = formData["description"];
                }
                if (formData["author"] !== ""){
                  data['author'] = formData["author"];                
                }
                if (status === 'completed') {
                    setIsPolling(false);
                    let { json_file_name, jsonContent } = await uiStore.newTranscription.completeTranscription(data,recordingsStore);
                    toast({
                      title: "Transcription Completed",
                      description: "Transcription Proccessed successfully",
                      status: "success",
                      duration: 5000,
                      isClosable: true,
                    });
                    const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
                    // Create a FormData object and append the file Blob to it
                    const formData = new FormData();
                    formData.append('file', jsonBlob, json_file_name);
                    
                    // Send the FormData with the fetch request to your API endpoint
                    fetch('/api/s3/upload-json', {
                      method: 'POST',
                      body: formData,
                    })
                    .then(response => {
                      if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }
                      return response.json();
                    })
                    .then(uploadResponse => {
                      // Handle the successful upload response
                      console.log('JSON file uploaded:', uploadResponse);
                    });   
                }
                else {
                    console.log('Transcription not yet complete:', status);
                }
            }
            
            // You might want to update the state with the latest status
          } catch (error) {
            console.error('Error polling the endpoint:', error);
          }
        }
      }, 10000);
  
      return () => clearInterval(intervalId);
    }, [isPolling, transactionId, recordingsStore]);
  
    return (
        <div>
        {uiStore.newTranscription.isTranscribing ? (
            <Button colorScheme="blue" size="md" w='35vh' isLoading loadingText='Transcribing... Please wait.'></Button>
        ) : null}
      </div>
    );
  };
export const NewTranscriptionButton = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [audioSource, setAudioSource] = React.useState('file');
    const toast = useToast();

    function uploadToPresignedUrl(url: string, data: Blob) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', url);
      
          // Set up any headers here
          xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      
          // Handle the progress event
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentage = (event.loaded / event.total) * 100;
              uiStore.newTranscription.updateUploadPercentage(percentage);
            }
          };
      
          // Set up the response handling
          xhr.onload = () => {
            if (xhr.status === 200) {
              uiStore.newTranscription.completeUpload();
              resolve(xhr.responseText);
            } else {
              reject(new Error(`Server responded with ${xhr.status}`));
            }
          };
      
          // Handle network errors
          xhr.onerror = () => {
            reject(new Error("Network Error"));
          };
      
          // Handle the start and end of the upload
          xhr.onloadstart = () => {
            uiStore.newTranscription.startUpload();
          };
      
          xhr.onloadend = () => {
            uiStore.newTranscription.completeUpload();
          };
      
          // Send the request
          xhr.send(data);
        });
      }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log(formData);
        formData.forEach((value, key) => {
          uiStore.newTranscription.setField(key, value);
        })
        const file = formData.get('file_Input');
    
        if (file && file instanceof File) {
            onClose();
            try {
                // Send only the filename to your API
                const response = await fetch('/api/s3/create-presigned-urls', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filename: file.name }),
                });
                let randomized_file_url = "";
                let assembly_ai_transcript_id = "";
                if (response.ok) {
                    response.json().then(({ signedPutUrlObject, signedGetUrlObject }) => {
                      // Perform the upload directly to the presignedURL
                      uploadToPresignedUrl(signedPutUrlObject, file)
                        .then(uploadResponse => {
                          console.log('File uploaded successfully:', uploadResponse);
                          // Start transcription via assemblyAI
                          fetch('/api/assemblyAI/start-transcription', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ s3presignedurl: signedGetUrlObject }),
                          })
                            .then(resp => resp.json())
                            .then(resp_json => {
                              assembly_ai_transcript_id = resp_json.data.id;
                              randomized_file_url = signedGetUrlObject.split("?")[0];
                              let json_file = uiStore.newTranscription.startTranscription(assembly_ai_transcript_id, randomized_file_url);
                              // Handle successful upload response here
                              console.log('File Transcribed` started:', resp_json);
                              // Consider showing toast or updating UI here
                            })
                            .catch(error => {
                              console.error('Error starting transcription:', error);
                              // Handle error starting transcription here
                            });
                        })
                        .catch(uploadError => {
                          console.error('Error uploading file:', uploadError);
                          // Handle file upload error here
                        });
                    })
                    .catch(jsonError => {
                      console.error('Error parsing response to JSON:', jsonError);
                      // Handle error parsing response here
                    });
                  } else {
                    console.error('Network response was not ok.');
                    // Handle network response error here
                  }
            } catch (error) {
                console.error('Error:', error);
                // Handle the error
            }
        }
        else if (audioSource === 'url') {
          onClose();
          fetch('/api/assemblyAI/start-transcription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ s3presignedurl: formData.get('audio_url') }),
          })
          .then(resp => resp.json())
          .then((resp_json): void => {
            let randomized_file_url = formData.get('audio_url');
            if (randomized_file_url instanceof File) {
              console.log("how did this happen, randomized_file_url is a file")
            }
            else {
              uiStore.newTranscription.startTranscription(resp_json.data.id, randomized_file_url || '');
              // Handle successful upload response here
              console.log('File Transcribed` successfully:', resp_json);
              // Consider showing toast or updating UI here
            }
          })
        }
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
                                <FormLabel>Author</FormLabel>
                                <FormHelperText>Enter a the Authors name for this transcription</FormHelperText>
                                <Input name="author" placeholder="John Doe" /> 
                            </FormControl>
                            <FormControl mt={4}>
                                <FormLabel>Number of Speakers</FormLabel>
                                <Input type="number" name="number_of_speakers" placeholder="Enter the number of speakers" />
                                </FormControl>
                                <FormControl mt={4}>
                                    <FormLabel>Audio Source</FormLabel>
                                    <Select name="audio_source" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAudioSource(e.target.value)}>
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

    let transcriptionStatus;
    const recordingsStore = useStore().recordingsStore;
    if (uiStore.newTranscription.isUploading) {
        transcriptionStatus = (<UploadProgress />);
    }
    else if (uiStore.newTranscription.isTranscribing) {
        transcriptionStatus = (<PollingComponent transactionId={uiStore.newTranscription.transcriptionId||""} recordingsStore={recordingsStore} />);
    }
    else {
        transcriptionStatus = (<NewTranscriptionButton />);
    }
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