import { NextApiRequest, NextApiResponse } from 'next';
import formidable, {errors as formidableErrors} from 'formidable';
import { Upload } from '@aws-sdk/lib-storage';
import { PassThrough } from 'stream';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import VolatileFile from 'formidable/VolatileFile';

interface ExtendedVolatileFile extends VolatileFile {
    originalFilename?: string;
  }

export const config = {
  api: {
    bodyParser: false, // Disables body parsing; we'll use formidable for that
  },
};

const s3Client = new S3Client({
    region: process.env.AWS_REGION || '',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const uploadStream = (file?: ExtendedVolatileFile | undefined) => {
    // Specify the bucket name and the file name (key)
    const bucketName = process.env.AWS_BUCKET_NAME || '';
    const pass = new PassThrough();
    console.log("volatile file", file);
    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: bucketName,
            Key: file?.originalFilename,
            Body: pass,
        },
    });
    upload.done();
  
    return pass;
  };

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({
    fileWriteStreamHandler: uploadStream,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing the file upload' });
      return;
    }

    // Assuming there's a "file" in the form submission
    const file = files.file;
    if (!file) {
      res.status(400).json({ error: 'No file found' });
      return;
    }

    // Here, you would handle the file, e.g., upload it to S3
    console.log('Received file:', file);
    // Respond to the client
    res.status(200).json({ message: 'File uploaded successfully' });
  });
}