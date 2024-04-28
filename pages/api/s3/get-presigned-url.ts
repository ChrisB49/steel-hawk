
import { NextApiRequest, NextApiResponse } from 'next';

import { v4 as uuidv4 } from 'uuid';
import { getPresignedUrlWithoutClient } from '@/app/lib/utilities';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            console.log("getPresignedUrl", req.query.s3ObjectUrl)
            const s3ObjectUrlRaw = req.query.s3ObjectUrl;
            const s3ObjectUrl = Array.isArray(s3ObjectUrlRaw) ? s3ObjectUrlRaw[0] : s3ObjectUrlRaw || '';
            const signedGetUrlObject = await getPresignedUrlWithoutClient({
                s3ObjectUrl
            });
            res.status(200).json({ success: true, signedGetUrlObject: signedGetUrlObject });
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