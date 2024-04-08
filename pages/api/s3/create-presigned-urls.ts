
import { NextApiRequest, NextApiResponse } from 'next';

import { v4 as uuidv4 } from 'uuid';
import { createPresignedUrlWithoutClient } from '@/app/lib/utilities';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { filename } = req.body; // Extract filename from the request body
            const fileExtension = filename.split('.').pop();
            const fileKey = `${uuidv4()}.${fileExtension}`;
            const [signedPutUrlObject, signedGetUrlObject] = await createPresignedUrlWithoutClient({
                region: process.env.AWS_REGION || '',
                bucket: process.env.AWS_BUCKET_NAME || '',
                key: fileKey,
            });
            res.status(200).json({ success: true, signedPutUrlObject: signedPutUrlObject, signedGetUrlObject: signedGetUrlObject });
        } catch (error) {
            console.error('S3 presigned URL generation error:', error);
            res.status(500).json({ success: false, error: "Failed to generate presigned URL" });
        }
    } else {
        // Handle any other HTTP methods
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}