import { RecordingsStore, Recording, Audio, Transcript, Utterance, Word } from '@/stores/RecordingStore';
import { useStore } from '@/app/providers';
import { huhu_data } from '@/stores/huhu_test_data';
import { george_data } from '@/stores/george_test_data';
import { test_data } from '@/stores/test_data_2';
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { HttpRequest } from "@smithy/protocol-http";
import {
  S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@smithy/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { Hash } from "@smithy/hash-node";

export function formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

export const createPresignedUrlWithoutClient = async ({ region, bucket, key }: { region: string; bucket: string; key: string }) => {
    const url = parseUrl(`https://${bucket}.s3.${region}.amazonaws.com/${key}`);
    const presigner = new S3RequestPresigner({
      credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      region,
      sha256: Hash.bind(null, "sha256"),
    });
  
    const signedPutUrlObject = await presigner.presign(
      new HttpRequest({ ...url, method: "PUT" }),
    );
    const signedGetUrlObject = await presigner.presign(
      new HttpRequest({ ...url, method: "GET" }),
    )
    return [formatUrl(signedPutUrlObject), formatUrl(signedGetUrlObject)];
  };

export const getPresignedUrlWithoutClient = async ({ s3ObjectUrl }: { s3ObjectUrl: string }) => {
    const url = parseUrl(s3ObjectUrl);
    const presigner = new S3RequestPresigner({
      credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      region: process.env.AWS_REGION || '',
      sha256: Hash.bind(null, "sha256"),
    });
    const signedGetUrlObject = await presigner.presign(
      new HttpRequest({ ...url, method: "GET" }),
    )
    return formatUrl(signedGetUrlObject);
}

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
    const default_utterance = new Utterance("Hello World", 0, 1, 1, "This application is under development, please do not share, record or forward to anyone, this is meant for the recipient only", []);
    const default_recording = new Recording(todays_date, "Chris Becak", "Default Recording", default_audio, default_transcript, [default_utterance]);
    recordingsStore.addRecording(default_recording);
    console.log("Added Default Recordings", default_recording)
    return default_recording;
}

export interface dataJsonFormat {
    audio_url: string,
    author: string,
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
        console.log("Invalid data object passed to createRecordingObjectsFromDataJson", data);
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
    const recording_object = new Recording(new Date(), data.author || "Chris Becak", data.summary, audio_object, transcript_object, utterances);
    return recording_object;
}
