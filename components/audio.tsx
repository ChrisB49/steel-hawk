'use client';
import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { uiStore } from '@/stores/UIStore';
import { RecordingsStore } from '@/stores/RecordingStore';

export const AudioPlayer: React.FC<{ recordingsStore: RecordingsStore }> = observer(({recordingsStore}) => {
    const audioRef = useRef(new Audio());
    const lastUpdateTimeRef = useRef(0);

    useEffect(() => {
        if (audioRef.current) {
          audioRef.current.loop = uiStore.looping;
        }
      }, [uiStore.looping]);

       // Effect for volume and mute
    useEffect(() => {
        if (audioRef.current) {
        audioRef.current.volume = uiStore.volume;
        audioRef.current.muted = uiStore.muted;
        }
    }, [uiStore.volume, uiStore.muted]);

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
        uiStore.setSeekPosition(currentTime); // Update UIStore's seek position only
        lastUpdateTimeRef.current = now; // Update the last update time

        const currentRecording = recordingsStore.getCurrentRecording();
        const utterance = currentRecording ? currentRecording.getUtteranceByTime(currentTime) : null;
        const word = utterance ? utterance.getWordByTime(currentTime) : null;
        if (word) {
            //first, unfocus the current utterance if it is different than the new one
            const currentFocusedUtterance = currentRecording?.getCurrentlyFocusedUtterance();
            if (currentFocusedUtterance != utterance) {
                currentFocusedUtterance?.toggleFocus();
                utterance?.toggleFocus();
            }
            const currentFocusedWord = currentFocusedUtterance?.getFocusedWord();
            if (currentFocusedWord != word) {
                currentFocusedWord?.toggleHighlighted();
                word.toggleHighlighted();
            }
        }
    };

    return (
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} preload="auto">
            Your browser does not support the audio element.
        </audio>
    );
});