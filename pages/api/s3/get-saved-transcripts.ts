import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextApiRequest, NextApiResponse } from 'next';


const s3Client = new S3Client({
    region: process.env.AWS_REGION || '',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

async function getMostRecentSavedRecordingFromS3(excluding: string[] | null) {
    const bucketName = process.env.AWS_BUCKET_NAME || '';
    //TODO: REMOVE ME
    console.log("AWS_REGION:", process.env.AWS_REGION);
    console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
    console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
    try {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
        });
        console.log("command", command);
        const { Contents } = await s3Client.send(command);
        console.log("Successfully got list of files in the bucket", Contents);

        // Filter out files that are in the excluding array, if it is provided
        const filteredContents = Contents?.filter((object) =>
            object.Key?.endsWith('.json') && (!excluding || !excluding.includes(object.Key))
        );

        // Assuming the S3 objects have a LastModified property
        const sortedJsonObjects = filteredContents?.sort((a, b) => {
            if (a.LastModified && b.LastModified) {
                // Both dates are defined, so we can compare them
                return new Date(b.LastModified).getTime() - new Date(a.LastModified).getTime();
            } else if (a.LastModified) {
                // Only a is defined, so it should come first
                return -1;
            } else if (b.LastModified) {
                // Only b is defined, so it should come first
                return 1;
            } else {
                // Neither is defined, so they are equal in terms of sorting
                return 0;
            }
        });

        // The most recent JSON file that is not in the excluding list
        return sortedJsonObjects && sortedJsonObjects.length > 0 ? sortedJsonObjects[0] : null;
    } catch (error) {
        console.error('Error retrieving recordings from S3:', error);
        throw new Error('Error retrieving recordings from S3');
    }
}

async function downloadFileFromS3(key: string) {
    if (!key) {
        return null;
    }
    const bucketName = process.env.AWS_BUCKET_NAME || '';
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    try {
        const response = await s3Client.send(command);

        if (response.Body) {
            return await response.Body?.transformToString("utf8");;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error downloading file from S3:', error);
        throw new Error('Error downloading file from S3');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const excluding = req.query.excluding ? req.query.excluding as string[] : null;
            const mostRecentFile = await getMostRecentSavedRecordingFromS3(excluding);
            const file_obj = await downloadFileFromS3(mostRecentFile?.Key || '');
            //return only the file contents
            if (file_obj) {
                return res.status(200).json(file_obj);
            } else {
                res.status(404).json({ message: 'No recent JSON file found.' });
            }
        } catch (error: any) {
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}