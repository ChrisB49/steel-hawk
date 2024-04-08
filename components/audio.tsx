import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { uiStore } from '@/stores/UIStore';

export const AudioPlayer = observer(() => {
    const audioRef = useRef(new Audio());
    const lastUpdateTimeRef = useRef(0);
    useEffect(() => {
        // Load new audio source when URL changes
        const currentURL = uiStore.getCurrentlyPlayingURL();
        if (currentURL) {
            audioRef.current.src = currentURL;
            audioRef.current.load();
        }
    }, [uiStore.currentlyPlayingURL]);

    useEffect(() => {
        // Play or pause audio when playing state changes
        if (uiStore.playing) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [uiStore.playing]);

    //useEffect(() => {
    //    const handleSeek = (event: any) => {
    //        if (!isNaN(uiStore.seekPosition)) {
    //            audioRef.current.currentTime = uiStore.seekPosition;
    //        }
    //    };
//
    //    // Add event listener for seeking
    //    audioRef.current.addEventListener('seeked', handleSeek);
//
    //    // Cleanup listener when component unmounts
    //    return () => {
    //        audioRef.current.removeEventListener('seeked', handleSeek);
    //    };
    //}, [uiStore.seekPosition]);

    useEffect(() => {
        // Define a function that updates the audio element's currentTime
        const syncAudioWithSeekPosition = () => {
            const seekTime = uiStore.seekPosition;
            if (!isNaN(seekTime) && audioRef.current) {
                audioRef.current.currentTime = seekTime;
            }
        };

        // Call the function whenever uiStore.seekPosition changes
        if (uiStore.userInitiatedSeekEvent) {
            syncAudioWithSeekPosition();
        }
        // If you have a way to differentiate between user-initiated seeks and automatic updates,
        // you can add a condition here to only call syncAudioWithSeekPosition for user-initiated seeks.
    }, [uiStore.seekPosition]);

    useEffect(() => {
        // Apply the playback speed whenever it changes
        const currentPlaySpeed = uiStore.playSpeed;
        audioRef.current.playbackRate = currentPlaySpeed;
    }, [uiStore.playSpeed]);

    const handleTimeUpdate = () => {
        const currentTime = audioRef.current.currentTime;
        const now = Date.now();
        // Update only if more than 500ms have passed since the last update
        if (now - lastUpdateTimeRef.current > 500) {
            uiStore.setSeekPosition(currentTime); // Update UIStore's seek position only
            lastUpdateTimeRef.current = now; // Update the last update time
            console.log('Current time:', currentTime);
        }
    };
    const handleSeek = (time: number) => {
        // When the user seeks, update the currentTime of the audio element
        audioRef.current.currentTime = time;
    };

    return (
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} preload="auto">
            Your browser does not support the audio element.
        </audio>
    );
});