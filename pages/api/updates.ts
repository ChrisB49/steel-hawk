// pages/api/updates.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const sendUpdate = (data: string) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Example: Send initial message
    sendUpdate(JSON.stringify({ status: 'Connected', details: 'Waiting for upload' }));

    // Example: Simulate upload completion after 5 seconds
    setTimeout(() => {
      sendUpdate(JSON.stringify({ status: 'TranscriptionUploaded' }));
    }, 5000);

    req.on('close', () => {
      console.log('Client closed connection');
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}