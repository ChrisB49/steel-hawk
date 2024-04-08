import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import { uiStore } from '@/stores/UIStore';
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

    async getAudioUrl() {
        //if the audio is an url that is a s3 bucket, we need to get a presigned url that allows for GET.
        if (this.url.includes("s3") && this.url.includes("amazonaws.com")) {
            const response = await axios.get(`/api/s3/get-presigned-url?${this.url}`);
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
    editLog: any[]; // Define a more specific type based on your edit log structure

    constructor(transcribedOn: Date, editLog: any[]) {
        this.transcribedOn = transcribedOn;
        this.editLog = editLog;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    returnJSON() {
        return {
            transcribedOn: this.transcribedOn,
            editLog: this.editLog
        }
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

    returnJSON() {
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

    returnJSON() {
        return {
            created: this.created,
            creator: this.creator,
            description: this.description,
            audio: this.audio.returnJSON(),
            transcription: this.transcription.returnJSON(),
            utterances: this.utterances.map(utt => utt.returnJSON()),
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

    setCurrentRecording(recording: Recording) {
        this.currentRecording = recording;
        uiStore.setDuration(recording.audio.length);
        uiStore.setPlaySpeed(1);
        uiStore.setSeekPosition(0);
        uiStore.setCurrentlyPlayingURL(recording.audio.url);
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