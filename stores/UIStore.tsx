import { createRecordingObjectsFromDataJson } from "@/app/lib/utilities";
import { makeAutoObservable } from "mobx";
import { useStore } from '@/app/providers';
import { Recording, RecordingsStore, Utterance } from "./RecordingStore";
class NewTranscription {
    isTranscribing: boolean = false;
    isUploading: boolean = false;
    uploadingPercentage: number = 0;
    transcriptionId: string | null = null;
    fileName: string = "";
    file: File | null = null;
    formFields: { [key: string]: string } = {};

    startTranscription(transcriptionId: string, fileName: string) {
        this.transcriptionId = transcriptionId;
        this.fileName = fileName;
        this.isTranscribing = true;
    }

    async completeTranscription(assemblyAIData: any, recordingsStore: RecordingsStore) {
        assemblyAIData.audio_url = this.fileName;
        const newRecording = createRecordingObjectsFromDataJson(assemblyAIData);
        recordingsStore.addRecording(newRecording);
        await recordingsStore.setCurrentRecording(newRecording);
        console.log('New Recording added to recording store', newRecording);
        this.transcriptionId = null;
        this.isTranscribing = false;
        return newRecording.generateJSONFile();
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

class EditSpeakerModal {
    initialSpeakerName: string = "";
    editedSpeakerName: string = "";
    recording: Recording | null = null;
    constructor(initialSpeakerName: string) {
        this.initialSpeakerName = initialSpeakerName;
    }

    setSpeakerName(editedSpeakerName: string) {
        this.editedSpeakerName = editedSpeakerName;
    }

    getInitialSpeakerName() {
        return this.initialSpeakerName;
    }

    modalOpened(utterance: Utterance, recording: Recording) {
        this.initialSpeakerName = utterance.speaker;
        this.recording = recording;
    }

    modalClosed(recording: Recording, utterance_index: number, global_change: boolean) {
        //code to save the changes here
        if (global_change) {
            //change every utterance the speaker is in to the new name
           for (let i = 0; i < recording.utterances.length; i++) {
               if (recording.utterances[i].speaker === this.initialSpeakerName) {
                   recording.utterances[i].speaker = this.editedSpeakerName;
               }
           }
        }
        else {
            //change only the specific utterance
            let utterance = recording.utterances[utterance_index];
            utterance.speaker = this.editedSpeakerName;
            recording.utterances[utterance_index] = utterance;
        }
        this.initialSpeakerName = "";
        this.editedSpeakerName = "";
        this.recording = null;
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
    currentlyEditedRow: number | null = null;
    currentlyEditedWord: [number, number] | null = null;


    resetUIState() {
        this.newTranscription = new NewTranscription();
        this.currentlyPlayingURL = null;
        this.duration = 0;
        this.seekPosition = 0;
        this.userInitiatedSeekEvent = false;
        this.playing = false;
        this.looping = false;
        this.currentlyEditedRow = null;
        this.currentlyEditedWord = null;
    }

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
    
    startEditingRow(row_index: number) {
        this.currentlyEditedRow = row_index;
        console.log("Editing row:", row_index);
    }
    
    getEditingRow() {
        return this.currentlyEditedRow;
    }

    stopEditingRow() {
        this.currentlyEditedRow = null;
        //TODO: Audit log stuff here
    }

    startEditingWord(row_index: number, word_index: number) {
        this.currentlyEditedWord = [row_index, word_index];
    }

    getEditingWord() {
        return this.currentlyEditedWord;
    }

    stopEditingWord() {
        this.currentlyEditedWord = null;
        //TODO: Audit log stuff here
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
        this.userInitiatedSeek(this.seekPosition += 15);
    }

    backwardFifteenSeconds() {
        this.userInitiatedSeek(this.seekPosition -= 15);
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

    setMute(muted: boolean): void {
        this.muted = muted;
    }

    toggleMute(): void {
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
        console.log("Created UIStore", this);
    }
    
}

export const uiStore = new UIStore();