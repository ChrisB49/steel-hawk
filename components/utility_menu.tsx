'use client'
import { FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Button, useToast, Container, Link, VStack, HStack, Image, FormHelperText, Select } from '@chakra-ui/react'
import { AddIcon, EditIcon } from '@chakra-ui/icons';

import { useDisclosure } from '@chakra-ui/hooks';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';

AWS.config.update({
    region: 'ca-central-1', // e.g., 'us-west-2'
    credentials: new AWS.Credentials({
        accessKeyId: process.env.S3accessKeyId || '',
        secretAccessKey: process.env.S3secretAccessKey || '',
    }),
  });
  
  // Create an instance of the S3 service object
  const s3 = new AWS.S3();

export const NewTranscriptionButton = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [audioSource, setAudioSource] = React.useState('file');
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const file = formData.get('fileInputName');
        if (file && file instanceof File) {
            const fileKey = `${uuidv4()}-${file.name}`;
            const uploadParams = {
                Bucket: 'steel-hawk',
                Key: fileKey,
                Body: file,
            };
    
            try {
                const uploadResult = await s3.upload(uploadParams).promise();
                
                // If upload is successful, you can use the S3 URL
                const s3Url = uploadResult.Location;
                
                // Here you can call your RecordingStore to add the new recording
                // with the S3 URL as the audio source URL
    
            } catch (error) {
                console.error('S3 Upload Error:', error);
                // Handle the upload error
            }
        }
        const data = Object.fromEntries(formData.entries());
        console.log(data); // Do something with the form data
        onClose();
        toast({
            title: "Transcription created",
            description: "Transcription created successfully",
            status: "success",
            duration: 5000,
            isClosable: true,
        })
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
                                        <Input type="file" name="fileInputName" accept=".3ga,.8svx,.aac,.ac3,.aif,.aiff,.alac,.amr,.ape,.au,.dss,.flac,.flv,.m4a,.m4b,.m4p,.m4r,.mp3,.mpga,.ogg,.oga,.mogg,.opus,.qcp,.tta,.voc,.wav,.wma,.wv" />
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



export function UtilityMenu() {
    return (
            <Container rounded={10} bg='black'>
                <HStack align="center" direction="column" spacing={2}>
                    <Image src="static/img/nammu_logo_inverted.png" alt="Logo" w="150px" h="150px" />
                    <VStack>
                        <NewTranscriptionButton />
                        <Button leftIcon={<EditIcon />} colorScheme="blue" size="md" w='35vh' >
                            <Link href='/'>Format/Export</Link>
                        </Button>
                    </VStack>
                </HStack>
            </Container >
            )
}