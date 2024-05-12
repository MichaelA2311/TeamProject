import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import styles from '@shared/file-comp/ListComponent.module.css';
import globalStyles from '@src/App.module.css';

import { ProjectInfo } from '@src/Interfaces';

import { getTimeAgo, cropString } from "@src/utils";
import AWS from 'aws-sdk';


AWS.config.update({
    accessKeyId: process.env.REACT_APP_MINIO_USER_NAME,
    secretAccessKey: process.env.REACT_APP_MINIO_PASSWORD,
    region: 'London', // Set the region accordingly
    s3ForcePathStyle: true, // Required for Minio
    signatureVersion: 'v4', // Use v4 signature for Minio
});

const s3 = new AWS.S3({
    endpoint: process.env.REACT_APP_MINIO_ENDPOINT,
});




const ProjectComponent = ({ project_id, slug, name, last_edited, size, onDelete }: ProjectInfo) => {
    const [imageUrl, setImageUrl] = useState(null || String);

    /**
     * Make an AWS request to
     *  - List all objects in a bucket using the projectID
     *  - Finds first image file in the bucket
     *  - Generated a signed url for this thumbnail
     *  Assuming that the project exists
     * 
     * @param {number} projectID - projectID fetched from database
     * @returns {void} - no return
     */
    const ProjectComponentThumbnail = () =>{
        s3.listObjectsV2({Bucket: `project-${project_id}`}, (err, data) => {
            if (err) {
                console.error('Error listing objects:', err);
                return;
            }

            if (data.Contents && data.Contents.length > 0) {
                const imageObject = data.Contents.find(obj => {
                    if (obj.Key) {
                        const key = obj.Key.toLowerCase();
                        return key.endsWith('.jpg') || key.endsWith('.jpeg') || key.endsWith('.png');
                    }
                    return false;
                });

                if (imageObject){
                    const thumbnailurl = s3.getSignedUrl('getObject', {Bucket:`project-${project_id}`, Key: imageObject.Key });
                    setImageUrl(thumbnailurl);
                }
            }
        });
    };
    useEffect(() => {
        ProjectComponentThumbnail();
    },[imageUrl]);

    return (
        <div className={styles.listComponent}>
            <Link to={`editor/regular/${slug}`} className={globalStyles.Link} >
                <div className={`${styles.listComponentLeft} {styles.projectComponentLeft}`}>
                    <img src={imageUrl} className={styles.thumbnail} alt=""></img>
                    <p className={styles.name}>{cropString(name, 20)}</p>
                </div>
            </Link>
            <div className={styles.listComponentRight}>
                <div className={styles.listComponentInfo}>
                    <p>Edited {getTimeAgo(last_edited)}</p>
                    <p>Project size: {size}</p>
                    <button onClick={() => {
                        onDelete(project_id);
                    }}>Delete Project</button>
                </div>
            </div>
        </div>
    );
};

export default ProjectComponent;