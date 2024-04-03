import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { transactionId } = req.query;
    if (!transactionId) {
      res.status(400).json({ error: 'Missing transactionId' });
      return;
    }
    // Perform your logic here, for example, check the status of the transcription
    const data = await checkTranscriptionStatus(transactionId);
    const status  = data.status;
  
    if (status) {
      res.status(200).json({ status: status, data: data });
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  }
  
  async function checkTranscriptionStatus(transactionId: string | string[]) {
    //check AssemblyAI for transcription status
    const baseUrl = 'https://api.assemblyai.com/v2'
    const headers = {
        authorization: process.env.ASSEMBLYAI_API_KEY
    }
    const getTranscription = await axios.get(`${baseUrl}/transcript/${transactionId}`, {
        headers
    });
    return getTranscription.data;
  }