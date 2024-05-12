import { ChangeEvent, useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";



import styles from "./CreatePodcast.module.css";
import globalStyles from "@src/App.module.css";

import axios from 'axios';
import AWS from 'aws-sdk';
import EditorOption from "./EditorOption";
import PodcastSectionUploads from "./PodcastSectionUploads";
import { FileInfo, PodcastSectionMinioManagement } from "@src/Interfaces";

import { sizeConversion } from "../../../utils";

const CreatePodcast: React.FC = () => {

    const API_ENDPOINT = process.env.REACT_APP_FLASK_API_DEVELOP;

    const navigate = useNavigate();

    const [projectName, setProjectName] = useState<string>('');
    const [editorSelection, setEditorSelection] = useState<string>("regular");
    const podcastSectionRef = useRef<PodcastSectionMinioManagement>(null);
    const [uploadedFiles,setUploadedFiles] = useState(0);
    const [fileIsUploading,setFileIsUploading] = useState<boolean>(false);
    const tempBucket = "temp";

    const projectSize = useRef<number>(0);

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

    /**
     * Calls Flask API to get the thumbnail for an uploaded file
     * 
     * @param {File} file - file to get the thumbnail from
     * @returns {void} - no return
     */
    const getThumbnail = useCallback(async (uploadedFile:File) => {
        const key = uploadedFile.name;
        try{
            const THUMBNAIL_ENDPOINT = (process.env.REACT_APP_FLASK_API_DEVELOP + '/get-thumbnail');
            const data = {
                "bucket": tempBucket,
                "key": key,
            };
            await axios.post(THUMBNAIL_ENDPOINT, data, {
                headers: {
                    "content-type": "json",
                },
            });
        }catch (e) {
            console.error(e);
        }
    }, []);


    /**
     * Makes an AWS request using S3 to add a file and it's thumbnail to minio/temp
     * Assuming that that bucket already exists
     * 
     * @param {ChangeEvent<HTMLInputElement>} event - event triggered by file upload
     * @returns {FileInfo} - metadata of the file uploaded
 o   */

    const uploadFile = async(event: ChangeEvent<HTMLInputElement>) : Promise<FileInfo|null> => {
        if (!event.target.files){
            console.error("No file found");
            return null;
        }
        const file = event.target.files[0];
        const key = file.name;
        
        const s3Params = {
            Bucket: tempBucket,
            Key: key,
            Body: file,
            ACL: 'public-read',
        };

        try{
            setFileIsUploading(true);
            await s3.upload(s3Params).promise();
            await s3.waitFor('objectExists', {Bucket: tempBucket, Key: key}).promise();
            await getThumbnail(file);
            setUploadedFiles((prev) => prev + 1);
            setFileIsUploading(false);
        } catch (e) {
            console.error(e);
        }

        const size_num = file.size;

        const file_metadata: FileInfo = {
            name: file.name,
            size: sizeConversion(file.size),
            file_type: file.type,
            thumbnail_url: (process.env.REACT_APP_MINIO_ENDPOINT + "/" + tempBucket + "/" + file.name + "_thumbnail.jpg"),
            onDelete: ()=>{},
        };

        projectSize.current += size_num;
        return file_metadata;
    };

    /**
     * Make an AWS request to
     *  - Make a new bucket using the projectID
     *  - Copy everything from the /temp bucket into that new project (including thumbnails)
     *  - Remove everything from /temp
     *  Assuming that that /temp bucket already exists
     * 
     * @param {number} projectID - porjectID fetched from database
     * @returns {void} - no return
     */

    const setupProjectBucket = async(projectID : number) => {
        const destinationBucket = "project-" + projectID.toString();
         
        const createBucketParams = {
            Bucket:destinationBucket,
            ACL: 'public-read',
            ObjectLockEnabledForBucket : false,
            ObjectOwnership: "BucketOwnerEnforced",
        };


        try{
            await s3.createBucket(createBucketParams).promise();
            return destinationBucket;
        }catch (error) {
            console.error(error);
        }

    };

    /**
     * Sends a request to the API to create a new podcast called {projectName}.
     * If successfully created, navigate to the editor page for the new project_id.
     */
    const uploadPodcast = async () => {
        try {
            const response = await fetch(`${API_ENDPOINT}/create/${projectName}`, {
                method: 'POST',
                headers: {
                    "content-type": "json",
                },
                body: JSON.stringify({
                    "size" : sizeConversion(projectSize.current),
                }),
            });
                
            if(!response.ok) {
                throw new Error(`Failed to create new project. Status: ${response.status.toString()}`);
            } 
            const responseData = await response.json();
            const projectBucketName = await setupProjectBucket(responseData.project_id);
            if (podcastSectionRef.current && projectBucketName != undefined){
                await podcastSectionRef.current.participantFiles(projectBucketName,s3,tempBucket);
                navigate(`/editor/${editorSelection}/${responseData.project_id}`);
            }
        } catch (e) {
            console.error('Error creating new project:', e);
        }
    };

    const changeProjectName = (event: ChangeEvent<HTMLInputElement>) => {
        setProjectName(event.target.value);
    };

    /**
     * Constructs the button element that allows the user to start editing.
     * The button will be disabled until:
     *   - At least one file has been uploaded
     *   - There is a project name
     */
    const startEditingButton = (
        projectName && uploadedFiles > 0 && (!fileIsUploading) ? (
            <Link to={'#'} className={globalStyles.Link}>
                <button onClick={uploadPodcast}>Start Editing</button>
            </Link>
        ) : (
            <button disabled>Start Editing</button>
        )
    );

    const projectNameComponent = (
        <div className={styles.projectName}>
            <p> Name of project </p>
            <input type="text" onChange={changeProjectName}/>
        </div>
    );


    return (
        <div className={globalStyles.mainContent} id={styles.main}>
            <div id={styles.fileAdd}>
                {projectNameComponent}
                <PodcastSectionUploads uploadFile={uploadFile} ref={podcastSectionRef}/>
            </div>
            <div id={styles.configurePodcast}>
                <EditorOption
                    chosen={editorSelection}
                    optionType={"Regular"}
                    handleChange={() => setEditorSelection("regular")}
                />
                <EditorOption
                    chosen={editorSelection}
                    optionType={"Waveform"}
                    handleChange={() => setEditorSelection("waveform")}
                />
                {startEditingButton}
            </div>
        </div>
    );
};

export default CreatePodcast;
