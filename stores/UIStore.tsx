import { makeAutoObservable } from "mobx";

class UIStore {
    confidenceDisplayThreshold: number = 0.85;
    isTranscribing: boolean = false;
    transcriptionId: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    setConfidenceDisplayThreshold(value: number) {
        this.confidenceDisplayThreshold = value;
    }

    getConfidenceDisplayThreshold() {
        return this.confidenceDisplayThreshold;
    }

    startTranscription(transcriptionId: string) {
        this.transcriptionId = transcriptionId;
        this.isTranscribing = true;
    }

    completeTranscription() {
        this.transcriptionId = null;
        this.isTranscribing = false;
    }
}

export const uiStore = new UIStore();