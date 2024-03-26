import { observable, action, computed, makeAutoObservable } from 'mobx';
import { AssemblyAI } from 'assemblyai';
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
}

export class Transcript {
    transcribedOn: Date;
    editLog: any[]; // Define a more specific type based on your edit log structure

    constructor(transcribedOn: Date, editLog: any[]) {
        this.transcribedOn = transcribedOn;
        this.editLog = editLog;
        makeAutoObservable(this, {}, { autoBind: true });
    }
}

export class Word {
    text: string;
    start: number;
    end: number;
    speaker: string;
    confidence: number;
    channel?: number;


    constructor(text: string, start: number, end: number, speaker: string, confidence: number, channel?: number) {
        this.text = text;
        this.start = start;
        this.end = end;
        this.speaker = speaker;
        this.confidence = confidence;
        this.channel = channel;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    getConfidence() {
        return this.confidence;
    }

    setConfidence(confidence: number) {
        this.confidence = confidence;
    }

    getChannel() {
        return this.channel;
    }

    setChannel(channel: number) {
        this.channel = channel;
    }

    getText() {
        return this.text;
    }

    setText(text: string) {
        this.text = text;
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

    constructor(utterance: string, start: number, end: number, confidence: number, speaker: string, words: Omit<Word, 'constructor'>[], channel?: number,) {
        this.utterance = utterance;
        this.start = start;
        this.end = end;
        this.confidence = confidence;
        this.speaker = speaker;
        this.channel = channel !== undefined ? channel : 0;
        this.words = words.map(word => new Word(word.text, word.start, word.end, word.speaker, word.confidence, this.channel));
        makeAutoObservable(this, {}, { autoBind: true });
    }

    getWords() {
        return this.words;
    }

    setWords(words: Word[]) {
        this.words = words;
    }


    getChannel() {
        return this.channel;
    }

    setChannel(channel: number) {
        this.channel = channel;
    }

    getSpeaker() {
        return this.speaker;
    }

    setSpeaker(speaker: string) {
        this.speaker = speaker;
    }

    getConfidence() {
        return this.confidence;
    }

    setConfidence(confidence: number) {
        this.confidence = confidence;
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

    setCurrentRecording(recording: Recording) {
        this.currentRecording = recording;
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

export class Recording {
    created: Date;
    creator?: any; // Define a more specific type based on your User/Company link
    description: string;
    audio: Audio;
    transcription: Transcript;
    utterances: Utterance[];

    constructor(created: Date, creator: any, description: string, audio: Audio, transcription: Transcript, utterances: Omit<Utterance, 'constructor'>[]) {
        this.created = created;
        this.creator = creator;
        this.description = description;
        this.audio = new Audio(audio.source, audio.length, audio.url, audio.bitrate, audio.numberOfSpeakers);
        this.transcription = new Transcript(transcription.transcribedOn, transcription.editLog);
        this.utterances = utterances.map(utt => new Utterance(utt.utterance, utt.start, utt.end, utt.confidence, utt.speaker, utt.words, utt.channel,));
        makeAutoObservable(this, {}, { autoBind: true });
    }
}