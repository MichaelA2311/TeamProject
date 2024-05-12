import { forwardRef, useImperativeHandle, useState } from "react";
import { PodcastSectionInfo, PodcastSectionProps } from "@src/Interfaces";
import styles from "./PodcastSectionUploads.module.css";
import UploadSection from "./UploadSection";

const PodcastSectionUploads = forwardRef(({ uploadFile } : PodcastSectionProps,ref)  => {

    const [sectionsInfo, setSectionsInfo] = useState<PodcastSectionInfo[]>([
        {
            id: 0,
            name: "General",
            files : [],
        },
    ]);



    /**
     * Updates the state of the sectionsInfo by adding a file to the file array that each seciton stores
     * 
     * @param {number} id - Section Area Id
     * @param {File} file - File that was just uploaded to said section
     */

    const uploadSectionFiles = (id : number, file : File) => {
        setSectionsInfo(prevState =>
            prevState.map(mapping => 
                mapping.id === id ? {... mapping, files: [...mapping.files,file]} :mapping,
            ),
        );
    };
    /**
     * This method is respnsible for exposing this component to it's parent.
     * The parent can call participantFiles and that calls minioParticipantFileManagement here
     * 
     * @param {React.ForwardedRef<unknown>} ref - reference for the parent to use
     */
    useImperativeHandle(ref,() => ({
        participantFiles : async (projectBucketName : string ,s3 : AWS.S3,tempBucket : string) => {
            await minioParticipantFileManagement(projectBucketName,s3,tempBucket);
        },
    }),[sectionsInfo]);


    const [nextSectionID, setNextSectionID] = useState<number>(1);

    /**
     * Creates a new seciton that is internally a hashmap
     * - Appends the id by 1
     * - Gives a new name
     * - Makes an empty file array 
     */
    const createNewSection = () => {
        setSectionsInfo([...sectionsInfo,{id: nextSectionID, name: "Participant " + nextSectionID, files:[]}]);
        setNextSectionID(nextSectionID + 1);
    };


    /**
     * 
     * For each defined section you do:
     *  - Get the name of it and format it to minio Standards (URLify it)
     *  - Make a folder inside of the projectBucket name for each defined section (e.g. project-6/participant-8/)
     *  - In that folder you iterate over all the files that were uploaded an append them
     *  - Dirty trick to copy the thumbnails as well
     * 
     * At the end all files end up being deleted from the temp folder and they are distributed in the correct folderr for backend processing 
     * 
     * @param {string} projectBucketName - The name of the bucket the parent created (e.g. project-6)
     * @param {AWS.S3} s3 - configured bucket that the child can use
     * @param {string} tempBucket - The temp bucket where all the files are when the are uploaded before a project is made (e.g. temp)
     */
    const minioParticipantFileManagement = async(projectBucketName : string,s3 : AWS.S3, tempBucket : string) => {
        await Promise.all(sectionsInfo.map(async (section) => {
            const formattedPrefix = section.name.toLocaleLowerCase().replace(" ", "-") + "/";
            const participantDirectoryParams = {
                Bucket: projectBucketName,
                Key: `${formattedPrefix}`,
                Body: `${section.id}`,
            };
            await s3.upload(participantDirectoryParams).promise();
            const newPrefix = formattedPrefix.slice(0,-1);
            for (const index in section.files){
                const intIndex = parseInt(index);
                const file = section.files[intIndex];
                if (file.type.startsWith("video")){

                    const thumbnailName = file.name + "_thumbnail.jpg";
                    const copyThumbnail = {
                        CopySource: `${tempBucket}/${thumbnailName}`,
                        Bucket: `${projectBucketName}/${newPrefix}`,
                        Key:`${thumbnailName}`,
                    };
                    const deleteThumbnail = {
                        Bucket: tempBucket,
                        Key: `${thumbnailName}`,
                    };

                    await s3.copyObject(copyThumbnail).promise();
                    await s3.deleteObject(deleteThumbnail).promise();

                }

                const copyFileParams = {
                    CopySource: `${tempBucket}/${file.name}`,
                    Bucket: `${projectBucketName}/${newPrefix}`,
                    Key:`${file.name}`,
                };

                const deleteFile = {
                    Bucket: tempBucket,
                    Key: `${file.name}`,
                };
                await s3.copyObject(copyFileParams).promise();
                await s3.deleteObject(deleteFile).promise();
            }
        }));

    };



    const newSectionButton = (
        <div>
            <button onClick={createNewSection}>Add participant</button>
        </div>
    );

    PodcastSectionUploads.displayName = "PodcastSectionUploads";
    return (
        <div className={styles.sectionsContainer}>
            {sectionsInfo.map((props: PodcastSectionInfo) => {
                return (
                    <UploadSection
                        key={props.id}
                        id={props.id}
                        name={props.name}
                        uploadFile={uploadFile}
                        fileState={uploadSectionFiles}
                    />
                );
            })}
            {newSectionButton}
        </div>
    );
});

export default PodcastSectionUploads;
