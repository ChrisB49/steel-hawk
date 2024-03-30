import { RecordingsStore, Recording, Audio, Transcript, Utterance, Word } from '@/stores/RecordingStore';
import { useStore } from '@/app/providers';
import { huhu_data } from '@/stores/huhu_test_data';
import { george_data } from '@/stores/george_test_data';
import { test_data } from '@/stores/test_data_2';

export function useGetOrSetDefaultRecordings() {
    console.log("getOrSetDefaultRecordings")
    const recordingsStore = useStore().recordingsStore;
    const existing_default_recording = recordingsStore.getRecordingByDescription("Default Recording");
    if (existing_default_recording) {
        return existing_default_recording;
    }
    const todays_date = new Date();
    const default_audio = new Audio("url", 100, "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
    const default_transcript = new Transcript(todays_date, []);
    const default_utterance = new Utterance("Hello World", 0, 1, 1, "Chris Becak", []);
    const default_recording = new Recording(todays_date, "Chris Becak", "Default Recording", default_audio, default_transcript, [default_utterance]);
    recordingsStore.addRecording(default_recording);
    console.log("Added Default Recordings", default_recording)
    const huhu_test_data: dataJsonFormat = huhu_data;
    const george_test_data: dataJsonFormat = george_data;
    const test_2_data: dataJsonFormat = test_data;
    const dummy_dataset = [huhu_test_data, george_test_data, test_2_data];
    dummy_dataset.forEach((data) => {
        const recording_object = createRecordingObjectsFromDataJson(data);
        recordingsStore.addRecording(recording_object);
    });
    return default_recording;
}

export interface dataJsonFormat {
    audio_url: string,
    audio_duration: number,
    summary: string | null,
    utterances: Array<{
        text: string,
        start: number,
        end: number,
        confidence: number,
        speaker: string,
        channel: string | null,
        words: Array<{
            text: string,
            start: number,
            end: number,
            confidence: number,
            speaker: string,
            channel: string | null,
        }> | null
    }>
}

export function createRecordingObjectsFromDataJson(
    data: dataJsonFormat) {

    let source = "";
    if (data.audio_url !== undefined && data.audio_duration !== undefined) {
        source = "url";
    }
    else {
        throw new Error("Invalid data object passed to createRecordingObjectsFromDataJson");
    }
    const audio_object = new Audio(source, data.audio_duration, data.audio_url);
    const transcript_object = new Transcript(new Date(), []);
    const utterances = data.utterances.map((utterance: any) => {
        const words = utterance.words.map((word: any) => {
            return new Word(word.text, word.start, word.end, word.speaker, word.confidence, word.channel);
        });
        return new Utterance(utterance.text, utterance.start, utterance.end, utterance.confidence, utterance.speaker, words, utterance.channel);
    });
    if (data.summary === null) {
        data.summary = "";
    }
    const recording_object = new Recording(new Date(), "Chris Becak", data.summary, audio_object, transcript_object, utterances);
    return recording_object;
}
