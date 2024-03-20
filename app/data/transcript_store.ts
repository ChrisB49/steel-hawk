//import { observable, action, computed } from 'mobx';
import { AssemblyAI } from 'assemblyai';
// Domain Object
/*class Transcription {
    id: string;
    text: string;
    timestamp: Date;

    constructor(id: string, text: string, timestamp: Date) {
        this.id = id;
        this.text = text;
        this.timestamp = timestamp;
    }
}

// Domain Store
class TranscriptionStore {
    @observable transcriptions: Transcription[] = [];

    @action
    addTranscription(id: string, text: string, timestamp: Date) {
        const newTranscription = new Transcription(id, text, timestamp);
        this.transcriptions.push(newTranscription);
    }

    @action
    removeTranscription(id: string) {
        this.transcriptions = this.transcriptions.filter(t => t.id !== id);
    }

    @computed
    get sortedTranscriptions() {
        return this.transcriptions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
} */


export function test_function() {
    const client = new AssemblyAI({
        apiKey: '8e3fd469c8ff496288bc5613d427c0e4',
    });

    const FILE_URL = 'https://imxze2im7tagxmrw.public.blob.vercel-storage.com/huhu-7YOnehm2uxQUbZP2b8vNkTRdAPUkyq.mp3';

    // You can also transcribe a local file by passing in a file path
    // const FILE_URL = './path/to/file.mp3';

    // Request parameters
    const params = {
        audio: FILE_URL,
        speaker_labels: true,
        language_detection: true,
    }

    const run = async () => {
        const transcript = await client.transcripts.transcribe(params)

        console.log('Transcript:', transcript)

        for (const utterance of transcript.utterances!) {
            console.log(`Speaker ${utterance.speaker}: ${utterance.text}`)
        }
    }

    run()
}
test_function();