import { RecordingsStore } from './RecordingStore';

export class RootStore {
    recordingsStore: RecordingsStore;

    constructor() {
        this.recordingsStore = new RecordingsStore();
    }
}