import { ChangeEvent, useRef, useState } from "react";
import { FileInfo, UploadSectionInfo } from "@src/Interfaces";
import styles from "./UploadSection.module.css";
import FileComponent from "@shared/file-comp/FileComponent";
import DeleteConfirmation from '@shared/delete-confirmation/DeleteConfirmation';
import AWS from 'aws-sdk';
import Loading from "@src/components/shared/loading-animation/Loading";

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

const UploadSection = ({id, name, uploadFile ,fileState}:UploadSectionInfo): JSX.Element => {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const inputFile = useRef<HTMLInputElement>(null);
    const [isConfirmationOpen, setConfirmationOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string>('');
    const [fileIsUploading,setFileIsUploading] = useState<boolean>(false);

    const handleDelete = (name : string) => {
        setProjectToDelete(name);
        setConfirmationOpen(true);
    };

    const handleConfirmDelete = async (name: string): Promise<void> => {
        try {

            // Delete the bucket itself
            await s3.deleteObject({ Bucket: 'temp', Key: name }).promise();
            await s3.deleteObject({ Bucket: 'temp', Key: `${name}_thumbnail.jpg` }).promise();
            
            setConfirmationOpen(false);

        } catch (error) {
            console.error('Error deleting project:', error);
        }
        setFiles((files) =>
            files.filter((file) => file.name !== name),
        );
        
    };

    const upload = async  (event:ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files){
            console.error("No files found");
            return;
        }
        setFileIsUploading(true);
        const fileMetadata = await uploadFile(event);
        setFileIsUploading(false);
        fileState(id,event.target.files[0]);
        if (fileMetadata !== null){
            setFiles([...files, fileMetadata]);
        }
    };

    return (
        <div className={styles.uploadBlock}>
            <p>{name}</p>
            <div className={styles.dragFiles}>
                <p className={styles.dragChild}> Drag and drop to add files </p>
                <input type="file" 
                    id="files" 
                    accept="video/*, audio/*" 
                    className={`${styles.dragChild} ${styles.fileUpload}`} 
                    ref={inputFile} 
                    onChange={upload}
                    title=" "
                    data-testid="files-area"/>
            </div>
            <div className={styles.filesText}>
                <p> Uploaded Files </p>
            </div>
            <div className={styles.uploadedFiles}>
                {files.map((props: FileInfo) => {
                    return (
                        <FileComponent
                            key={props.name}
                            name={props.name} 
                            size={props.size}
                            file_type={props.file_type}
                            thumbnail_url={props.thumbnail_url}
                            onDelete={() => handleDelete(props.name)}/>
                    );
                })}
                <>{fileIsUploading ? <Loading message="Uploading File"/> : null}</>
                <DeleteConfirmation
                    isOpen={isConfirmationOpen}
                    onCancelDelete={() => setConfirmationOpen(false)}
                    onConfirmDelete={() => handleConfirmDelete(projectToDelete)}
                    deletelocation="file"
                />
            </div>
        </div>
    );

};

export default UploadSection;
