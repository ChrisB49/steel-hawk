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

    constructor() {
        makeAutoObservable(this);
    }

    setConfidenceDisplayThreshold(value: number) {
        this.confidenceDisplayThreshold = value;
    }

    getConfidenceDisplayThreshold() {
        return this.confidenceDisplayThreshold;
    }

    
}

export const uiStore = new UIStore();