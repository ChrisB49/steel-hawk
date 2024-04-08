import { createRecordingObjectsFromDataJson } from "@/app/lib/utilities";
import { makeAutoObservable } from "mobx";
import { useStore } from '@/app/providers';
import { RecordingsStore } from "./RecordingStore";
class NewTranscription {
    isTranscribing: boolean = false;
    isUploading: boolean = false;
    uploadingPercentage: number = 0;
    transcriptionId: string | null = null;
    file: File | null = null;
    formFields: { [key: string]: string } = {};

    startTranscription(transcriptionId: string) {
        this.transcriptionId = transcriptionId;
        this.isTranscribing = true;
    }

    completeTranscription(assemblyAIData: any, recordingsStore: RecordingsStore) {
        const newRecording = createRecordingObjectsFromDataJson(assemblyAIData);
        recordingsStore.addRecording(newRecording);
        recordingsStore.setCurrentRecording(newRecording);
        console.log('New Recording added to recording store', newRecording);

        this.transcriptionId = null;
        this.isTranscribing = false;
    }

    startUpload() {
        this.isUploading = true;
        this.uploadingPercentage = 0;
    }

    updateUploadPercentage(percentage: number) {
        this.uploadingPercentage = percentage;
    }

    completeUpload() {
        this.isUploading = false;
        this.uploadingPercentage = 0;
    }

    setFile(file: File) {
        this.file = file;
      }

      setField(key: string, value: string | File) {
        if (value instanceof File) {
          this.setFile(value);
        } else {
          this.formFields[key] = value;
        }
      }

    getFields() {
        return this.formFields;
    }

    getFile() {
        return this.file;
    }

    getField(key: string) {
        return this.formFields[key];
    }

    constructor() {
        makeAutoObservable(this);
    }
}

class UIStore {
    confidenceDisplayThreshold: number = 0.85;
    newTranscription: NewTranscription = new NewTranscription();
    currentlyPlayingURL: string | null = null;
    volume: number = 0.5;
    muted: boolean = false;
    duration: number = 0;
    seekPosition: number = 0;
    userInitiatedSeekEvent: boolean = false;
    playing: boolean = false;
    playSpeed: number = 1;
    looping: boolean = false;


    toggleLooping() {
        this.looping = !this.looping;
    }

    setPlaySpeed(speed: number) {
        this.playSpeed = speed;
    }

    changePlaySpeed() {
        // Define the array of speeds
        const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];
        const currentSpeedIndex = speeds.indexOf(this.playSpeed);
        // If the current speed is the last one in the array, reset to the first speed; otherwise, go to the next speed
        const newSpeedIndex = currentSpeedIndex === speeds.length - 1 ? 0 : currentSpeedIndex + 1;
        this.playSpeed = speeds[newSpeedIndex];
    }

    togglePlaying() {
        this.playing = !this.playing;
    }

    setSeekPosition(position: number) {
        this.seekPosition = position;
        if (this.userInitiatedSeekEvent) {
            this.userInitiatedSeekEvent = false;
        }
    }

    userInitiatedSeek(time: number) {
        this.seekPosition = time;
        this.userInitiatedSeekEvent = true;
        // Signal that the user has initiated a seek
        // Optionally, you could use an event emitter or a callback here
      }

    forwardFifteenSeconds() {
        this.seekPosition += 15;
    }

    backwardFifteenSeconds() {
        this.seekPosition -= 15;
    }

    getSeekPosition() {
        return this.seekPosition;
    }

    setDuration(duration: number) {
        this.duration = duration;
    }

    getDuration() {
        return this.duration;
    }

    toggleMute() {
        this.muted = !this.muted;
    }

    setVolume(volume: number) {
        this.volume = volume;
    }

    getVolume() {
        return this.volume;
    }

    setCurrentlyPlayingURL(url: string | null) {
        this.currentlyPlayingURL = url;
    }

    getCurrentlyPlayingURL() {
        return this.currentlyPlayingURL;
    }

    setConfidenceDisplayThreshold(value: number) {
        this.confidenceDisplayThreshold = value;
    }

    getConfidenceDisplayThreshold() {
        return this.confidenceDisplayThreshold;
    }

    constructor() {
        makeAutoObservable(this);
    }
    
}

export const uiStore = new UIStore();