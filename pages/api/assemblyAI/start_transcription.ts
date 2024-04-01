
import { NextApiRequest, NextApiResponse } from 'next';

import axios from 'axios';

async function startAssemblyAITranscription(url: string) {
    const baseUrl = 'https://api.assemblyai.com/v2'
    const headers = {
        authorization: process.env.ASSEMBLYAI_API_KEY
    }
    const uploadResponse = await axios.post(`${baseUrl}/transcript`, {
        audio_url: url,
        speaker_labels: true,
        summarization: true,
        summary_model: "conversational",
        summary_type: "headline",
        entity_detection: true,
        punctuate: true,
        format_text: true,
    },{
        headers
    })
    return uploadResponse.data
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { s3presignedurl } = req.body; // Extract filename from the request body
            const result = await startAssemblyAITranscription(s3presignedurl);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('AssemblyAI transcription generation error:', error);
            res.status(500).json({ success: false, error: "Failed to generate transcription" });
        }
    } else {
        // Handle any other HTTP methods
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}