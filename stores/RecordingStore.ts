import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import { uiStore } from '@/stores/UIStore';
import { toJS } from 'mobx';
// Domain Object
export class Audio {
    source: string;
    length: number;
    url: string;
    bitrate?: number;
    numberOfSpeakers?: number;

    constructor(source: string, length: number, url: string, bitrate?: number, numberOfSpeakers?: number) {
        this.source = source;
        this.length = length;
        this.url = url;
        this.bitrate = bitrate;
        this.numberOfSpeakers = numberOfSpeakers;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    getRawAudioUrl(): string {
        return this.url;
    }

    isNammuS3AudioSource(): boolean {
        return this.url.includes("s3") && this.url.includes("amazonaws.com") && (this.url.includes(process.env.AWS_BUCKET_NAME || '')); 
    }

    async getAudioUrl(): Promise<string> {
        //if the audio is an url that is a s3 bucket, we need to get a presigned url that allows for GET.
        if (this.isNammuS3AudioSource()) {
            const response = await axios.get(`/api/s3/get-presigned-url?s3ObjectUrl=${this.url}`);
            const response_data = response.data;
            return response_data.signedGetUrlObject;
        }
        else{
            return this.url;
        }
    }

    returnJSON() {
        return {
            source: this.source,
            length: this.length,
            url: this.url,
            bitrate: this.bitrate,
            numberOfSpeakers: this.numberOfSpeakers
        }
    }
}

export class Transcript {
    transcribedOn: Date;
    assemblyAITranscriptID?: string;
    editLog: any[]; // Define a more specific type based on your edit log structure

    constructor(transcribedOn: Date, editLog: any[], assemblyAITranscriptID?: string) {
        this.transcribedOn = transcribedOn;
        this.editLog = editLog;
        this.assemblyAITranscriptID = assemblyAITranscriptID;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    returnJSON() {
        return {
            transcribedOn: this.transcribedOn,
            editLog: this.editLog,
            assemblyAITranscriptID: this.assemblyAITranscriptID
        }
    }
}

export class Word {
    text: string;
    start: number;
    end: number;
    speaker: string;
    confidence: number;
    highlighted: boolean;
    channel?: number;
    


    constructor(text: string, start: number, end: number, speaker: string, confidence: number, channel?: number) {
        this.text = text;
        this.start = start;
        this.end = end;
        this.speaker = speaker;
        this.confidence = confidence;
        this.highlighted = false;
        this.channel = channel;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    getConfidence(): number {
        return this.confidence;
    }

    setConfidence(confidence: number): void {
        this.confidence = confidence;
    }

    getChannel(): number | undefined {
        return this.channel;
    }

    setChannel(channel: number): void {
        this.channel = channel;
    }

    toggleHighlighted(): void {
        this.highlighted = !this.highlighted;
    }

    getHighlighted(): boolean {
        return this.highlighted;
    }

    getText(): string {
        return this.text;
    }

    setText(text: string) {
        this.text = text;
    }

    returnJSON() {
        return {
            text: this.text,
            start: this.start,
            end: this.end,
            speaker: this.speaker,
            confidence: this.confidence,
            channel: this.channel
        }
    }
}

export class Utterance {
    utterance: string;
    start: number;
    end: number;
    confidence: number;
    speaker: string;
    channel: number;
    words: Word[];
    focused: boolean;

    constructor(utterance: string, start: number, end: number, confidence: number, speaker: string, words: Omit<Word, 'constructor'>[], channel?: number,) {
        this.utterance = utterance;
        this.start = start;
        this.end = end;
        this.confidence = confidence;
        this.speaker = speaker;
        this.channel = channel !== undefined ? channel : 0;
        this.focused = false;
        this.words = words.map(word => new Word(word.text, word.start, word.end, word.speaker, word.confidence, this.channel));
        makeAutoObservable(this, {}, { autoBind: true });
    }

    getWords(): Word[] {
        return this.words;
    }

    setWords(words: Word[]): void {
        this.words = words;
    }

    getWordByTime(time: number): Word | null {
        const word = this.words.find(word => word.start / 1000 <= time && word.end / 1000 >= time);
        if (word) {
            return word;
        }
        return null;
    }

    getFocusedWord(): Word | null {
        const word = this.words.find(word => word.highlighted);
        if (word) {
            return word;
        }
        return null;
    }

    toggleFocus(): void {
        this.focused = !this.focused;
    }

    getFocused(): boolean {
        return this.focused;
    }

    getChannel(): number {
        return this.channel;
    }

    setChannel(channel: number): void {
        this.channel = channel;
    }

    getSpeaker(): string {
        return this.speaker;
    }

    setSpeaker(speaker: string): void {
        this.speaker = speaker;
    }

    getConfidence(): number {
        return this.confidence;
    }

    setConfidence(confidence: number): void {
        this.confidence = confidence;
    }

    returnJSON(): any {
        return {
            utterance: this.utterance,
            start: this.start,
            end: this.end,
            confidence: this.confidence,
            speaker: this.speaker,
            words: this.words.map(word => word.returnJSON()),
            channel: this.channel
        }
    }

}

interface RenameSpeakerAction {
    type: 'renameSpeaker';
    originalSpeakerName: string;
    newSpeakerName: string;
    utteranceIndexes: number[]; // Indexes of the utterances where the speaker name was changed
}
  
interface ModifyUtteranceAction {
    type: 'modifyUtterance';
    utteranceIndex: number;
    originalUtterance: Utterance;
    newUtterance: Utterance;
}
  
type Action = RenameSpeakerAction | ModifyUtteranceAction;


export class Recording {
    created: Date;
    creator?: any; // Define a more specific type based on your User/Company link
    title: string;
    description: string;
    audio: Audio;
    transcription: Transcript;
    utterances: Utterance[];
    actionHistory: Action[];
    redoStack: Action[];

    constructor(
        created: Date,
        creator: any,
        title: string,
        description: string,
        audio: Audio,
        transcription: Transcript,
        utterances: Omit<Utterance, 'constructor'>[],
        actionHistory: Action[] = [],
        redoStack: Action[] = []
    ) {
        this.created = created;
        this.creator = creator;
        this.title = title;
        this.description = description;
        this.audio = new Audio(audio.source, audio.length, audio.url, audio.bitrate, audio.numberOfSpeakers);
        this.transcription = new Transcript(transcription.transcribedOn, transcription.editLog, transcription.assemblyAITranscriptID);
        this.utterances = utterances.map(utt => new Utterance(utt.utterance, utt.start, utt.end, utt.confidence, utt.speaker, utt.words, utt.channel,));
        this.actionHistory = actionHistory; // Initialize the actionHistory
        this.redoStack = redoStack;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    getUtteranceByTime(time: number) {
        return this.utterances.find(utt => utt.start / 1000 <= time && utt.end / 1000 >= time);
    }

    getCurrentlyFocusedUtterance() {
        return this.utterances.find(utt => utt.focused);
    }

    generateJSONFile() {
        let json_file_name = "";
        if (this.audio.isNammuS3AudioSource()) {
            //if the recording audio source is S3 based, we will name the JSON recording file the same name as the audio file it relates to
            json_file_name = this.audio.getRawAudioUrl().split('/')[this.audio.getRawAudioUrl().split('/').length - 1];
            json_file_name = json_file_name.split('.')[0] + ".json";
        }
        else {
            //otherwise we will name the JSON recording file with the same id of the AssemblyAI transcription id
            json_file_name = this.transcription.assemblyAITranscriptID + '.json';
        }
        //export newRecording object to JSON to be stored in S3 alongside the audio file
        console.log("json_file_name", json_file_name)
        //create the JSON file object in memory
        const json_obj = this.returnJSON();
        console.log("json_obj of recording", json_obj)
        // Convert the JSON object to a string to be uploaded
        const jsonContent = JSON.stringify(json_obj);
        return { json_file_name, jsonContent };
    }

    updateSpeakerName(utteranceIndex: number, newSpeakerName: string, changeAll: boolean): void {
        const recording = this;
        if (!recording) return;

        // Find the original speaker's name and the indexes of all affected utterances.
        const originalSpeakerName = recording.utterances[utteranceIndex].speaker;
        const affectedUtteranceIndexes: number[] = [];

        // Perform the update, keeping track of all changes.
        if (changeAll) {
            recording.utterances.forEach((utt, index) => {
            if (utt.speaker === originalSpeakerName) {
                affectedUtteranceIndexes.push(index); // Track the index of the utterance being changed.
                utt.speaker = newSpeakerName; // Actually update the speaker name.
            }
            });
        } else {
            recording.utterances[utteranceIndex].speaker = newSpeakerName;
            affectedUtteranceIndexes.push(utteranceIndex); // Only this utterance index is affected.
        }
        // Record the action for undo/redo functionality.
        this.recordAction({
            type: 'renameSpeaker',
            originalSpeakerName: originalSpeakerName,
            newSpeakerName: newSpeakerName,
            utteranceIndexes: affectedUtteranceIndexes
        });
    }

    // Call this method whenever an action is taken that should be undoable
    recordAction(action: Action) {
        this.actionHistory.push(action);
        this.redoStack = []; // Clear the redo stack on new action
    }

    undo() {
        const lastAction = this.actionHistory.pop();
        if (lastAction) {
            this.applyAction(lastAction, 'undo');
            this.redoStack.push(lastAction);
        }
    }

    redo() {
        const nextAction = this.redoStack.pop();
        if (nextAction) {
            this.applyAction(nextAction, 'redo');
            this.actionHistory.push(nextAction);
        }
    }

    // Apply the action to revert or redo the change
    applyAction(action: Action, type: 'undo' | 'redo') {
        switch (action.type) {
            case 'renameSpeaker':
              const speakerName = type === 'undo' ? action.originalSpeakerName : action.newSpeakerName;
              action.utteranceIndexes.forEach(index => {
                this.utterances[index].speaker = speakerName;
              });
              break;
            case 'modifyUtterance':
              const utterance = type === 'undo' ? action.originalUtterance : action.newUtterance;
              this.utterances[action.utteranceIndex] = utterance;
              break;
        }
    }

    returnJSON() {
        console.log("returning json for recording, this is the contents of the undo/redo stack", this.actionHistory, this.redoStack)
        return {
            created: this.created,
            creator: this.creator,
            title: this.title,
            description: this.description,
            audio: this.audio.returnJSON(),
            transcription: this.transcription.returnJSON(),
            utterances: this.utterances.map(utt => utt.returnJSON()),
            actionHistory: toJS(this.actionHistory), 
            redoStack: toJS(this.redoStack), 
        }
    }
}

export class RecordingsStore {
    recordings: Recording[];
    currentRecording: Recording | null;

    constructor() {
        this.recordings = [];
        this.currentRecording = null;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    addRecording(recording: Recording) {
        this.recordings.push(recording);
    }

    getRecordings() {
        return this.recordings;
    }

    async setCurrentRecording(recording: Recording) {
        this.currentRecording = recording;
        uiStore.setDuration(recording.audio.length);
        uiStore.setPlaySpeed(1);
        uiStore.setSeekPosition(0);
        const temporary_url = await recording.audio.getAudioUrl();
        uiStore.setCurrentlyPlayingURL(temporary_url);
    }

    getCurrentRecording() {
        return this.currentRecording;
    }

    getRecordingByDescription(description: string) {
        const recording = this.recordings.find(recording => recording.description === description);
        if (recording) {
            return recording;
        }
        return null;
    }
}