import { observable, action, computed, makeAutoObservable } from 'mobx';
import { AssemblyAI } from 'assemblyai';
// Domain Object
class Audio {
    source: string;
    length: number;
    url: string;
    bitrate?: number;
    numberOfSpeakers?: number;

    constructor(source: string, length: number, url: string, bitrate?: number, numberOfSpeakers?: number) {
        makeAutoObservable(this);
        this.source = source;
        this.length = length;
        this.url = url;
        this.bitrate = bitrate;
        this.numberOfSpeakers = numberOfSpeakers;
    }
}

class Transcript {
    transcribedOn: Date;
    editLog: any[]; // Define a more specific type based on your edit log structure

    constructor(transcribedOn: Date, editLog: any[]) {
        makeAutoObservable(this);
        this.transcribedOn = transcribedOn;
        this.editLog = editLog;
    }
}

class Word {
    text: string;
    start: number;
    end: number;
    speaker: string;
    channel?: number;
    confidence: number;

    constructor(text: string, start: number, end: number, speaker: string, channel?: number, confidence: number) {
        makeAutoObservable(this);
        this.text = text;
        this.start = start;
        this.end = end;
        this.speaker = speaker;
        this.channel = channel;
        this.confidence = confidence;
    }
}

class Utterance {
    utterance: string;
    start: number;
    end: number;
    confidence: number;
    speaker: string;
    channel?: number;
    words: Word[];

    constructor(utterance: string, start: number, end: number, confidence: number, speaker: string, channel?: number, words: Omit<Word, 'constructor'>[]) {
        makeAutoObservable(this);
        this.utterance = utterance;
        this.start = start;
        this.end = end;
        this.confidence = confidence;
        this.speaker = speaker;
        this.channel = channel;
        this.words = words.map(word => new Word(word.text, word.start, word.end, word.speaker, word.channel, word.confidence));
    }
}

class RecordingsStore {
    recordings: Recording[];

    constructor() {
        makeAutoObservable(this);
        this.recordings = [];
    }

    addRecording(recording: Recording) {
        this.recordings.push(recording);
    }
}

class Recording {
    created: Date;
    creator?: any; // Define a more specific type based on your User/Company link
    description: string;
    audio: Audio;
    transcription: Transcript;
    utterances: Utterance[];

    constructor(created: Date, creator: any, description: string, audio: Audio, transcription: Transcript, utterances: Omit<Utterance, 'constructor'>[]) {
        makeAutoObservable(this);
        this.created = created;
        this.creator = creator;
        this.description = description;
        this.audio = new Audio(audio.source, audio.length, audio.url, audio.bitrate, audio.numberOfSpeakers);
        this.transcription = new Transcript(transcription.transcribedOn, transcription.editLog);
        this.utterances = utterances.map(utt => new Utterance(utt.utterance, utt.start, utt.end, utt.confidence, utt.speaker, utt.channel, utt.words));
    }
}