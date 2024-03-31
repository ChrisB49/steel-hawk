
import { NextApiRequest, NextApiResponse } from 'next';
import { fromIni } from "@aws-sdk/credential-provider-ini";
import { HttpRequest } from "@smithy/protocol-http";
import {
  S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@smithy/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { Hash } from "@smithy/hash-node";
import { v4 as uuidv4 } from 'uuid';

  const createPresignedUrlWithoutClient = async ({ region, bucket, key }: { region: string; bucket: string; key: string }) => {
  const url = parseUrl(`https://${bucket}.s3.${region}.amazonaws.com/${key}`);
  const presigner = new S3RequestPresigner({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
    region,
    sha256: Hash.bind(null, "sha256"),
  });

  const signedUrlObject = await presigner.presign(
    new HttpRequest({ ...url, method: "PUT" }),
  );
  return formatUrl(signedUrlObject);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { filename } = req.body; // Extract filename from the request body
            const fileKey = `${uuidv4()}-${filename}`;
            const presignedUrl = await createPresignedUrlWithoutClient({
                region: process.env.AWS_REGION || '',
                bucket: process.env.AWS_BUCKET_NAME || '',
                key: fileKey,
            });
            res.status(200).json({ success: true, presignedURL: presignedUrl });
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