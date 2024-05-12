import { useParams } from "react-router-dom";
import { createContext, createRef, useCallback, useEffect, useRef, useState } from "react";

import { funcProp, ProjectInfo } from "@src/Interfaces";

import ReactPlayer from "@ehibb/react-player";

import styles from './Editor.module.css';

import Transcript from "@features/transcription/Transcript";
import WaveForm from "@shared/waveform/WaveForm";
import Loading from "@shared/loading-animation/Loading";
import { OnProgressProps } from "@ehibb/react-player/base";

import axios from "axios";
import useUpdateLastEdited from "@src/hooks/useUpdateLastEdited";
import AWS, { AWSError } from 'aws-sdk';
import { GetObjectOutput } from "aws-sdk/clients/s3";

type ReactPlayerProvider = {
    playerRef : React.RefObject<ReactPlayer>,
    handleSeekTranscript: (newTime: number) => void,
    isPlaying: boolean,
    currentTime : number,
}

export const ReactPlayerContext = createContext<ReactPlayerProvider>({
    playerRef : createRef<ReactPlayer>(),
    handleSeekTranscript: () => {},
    isPlaying : false,
    currentTime : 0,
});


const Editor  =  (props: funcProp) => {

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

    const { controller_type, project_id } = useParams();

    // Initialise component states
    const callOnce = useRef<boolean>(true);

    const [projectInfo, setProjectInfo] = useState<ProjectInfo>();

    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [buttonText,setButtonText] = useState("Play");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime,setCurrentTime] = useState<number>(0);
    const playerRef = useRef<ReactPlayer>(null);
    const [didVideoSeek, setDidVideoSeek] = useState(false);

    props.func(`Editing ${projectInfo?.name || 'Unnamed Project'}`);

    // Whenever this component is re-rendered (i.e. an edit was made) call this hook
    useUpdateLastEdited(project_id);


    /**
     * Fetches current project from the database by calling the Flask API
     * 
     * @returns {Promise<void>} - returns a Promise that is resolved when the project is deleted. 
     * @throws {Error} - throws an error if there is an issue fetching projects.
     */
    const fetchProject = async (): Promise<void> => {
        try {
            const response = await fetch(process.env.REACT_APP_FLASK_API_DEVELOP + `/project/${project_id}`);
            if(!response.ok) {
                throw new Error(`Failed to fetch project. Status: ${response.status.toString()}`);
            } 
            setProjectInfo(await response.json());
        } catch (e) {
            console.error('Error fetching project:', e);
        }
    };


    /**
     * Fetches final podcast url from the minio storage by using the AWS SDK.
     * 
     * @returns {Promise<void>} - returns a Promise that is resolved when the podcast is fetched. 
     * @throws {Error} - throws an error if there is an issue fetching podcast.
     */
    const fetchVideoUrl = async () => {
        try {
            const params = {
                Bucket: `project-${project_id}`,
                Key: 'final-product/final_podcast_mastered.mp4',
            };

            s3.headObject(params, async function (err) {
                if (err){
                    mergePodcast(`project-${project_id}`);
                } else {
                    const url = await s3.getSignedUrlPromise('getObject', params);
                    setVideoUrl(url);   
                }
            });

        } catch (error) {
            console.error('Error fetching video URL:', error);
        }
    };


    /**
     * Calls Flask API to merge files into final podcast for given project.
     * 
     * @param {String} projectID - project to have files merged
     * @returns {void} - no return
     */
    const mergePodcast = useCallback(async (projectID:string) => {
        try{
            const MERGE_ENDPOIONT = (process.env.REACT_APP_FLASK_API_DEVELOP + '/merge-files');
            const data = {
                "bucket": projectID,
            };
            const response = await axios.post(MERGE_ENDPOIONT, data, {
                headers: {
                    "content-type": "json",
                },
            });
            const jsonResponse = response.data;
            if (jsonResponse.final_output_url){
                audioMaster(projectID);
            }
        }catch (e) {
            console.error(e);
        }
    }, []);
    

    /**
         * Calls Flask API to master audio of finalised podcast.
         * 
         * @param {String} projectID - project to have files merged
         * @returns {void} - no return
         */
    const audioMaster =  useCallback(async (projectID:string) => {
        try{
            const MASTER_ENDPOIONT = (process.env.REACT_APP_FLASK_API_DEVELOP + '/audio-master');
            const data = {
                "bucket": projectID,
            };
            const responseAudioMaster  = await axios.post(MASTER_ENDPOIONT, data, {
                headers: {
                    "content-type": "json",
                },
            });
            const jsonResponse = responseAudioMaster.data;
            if (jsonResponse.final_output_url){
                fetchVideoUrl();
            } else {
                console.error("Audio master error");
            }
            
        }catch (e) {
            console.error(e);
        }
    }, []);
    

    useEffect(() => {
        if (callOnce.current){
            fetchVideoUrl(); // Get video if it has already been processed
            fetchProject();
            callOnce.current = false;
        }
    }, []);


    /**
     * API call to create final version of video, where deleted words are properly removed
     * Once this call has successfully returned retrieve the raw video data from minio and download it
     *
     * @returns {void} - Nothing returned, but browser downloads video
     * @throws {Error} - throws error if there is an error with either the API call or minio call
     *
     */
    const exportPodcast = async () => {

        try{
            // Calling API to export the podcast
            const response = await fetch(process.env.REACT_APP_FLASK_API_DEVELOP
                + `/export-podcast/${project_id}`);
            if (!response.ok) {
                throw new Error(response.status.toString());
            }

            // Initialise location of project within MinIO
            const params = {
                Bucket: `project-${project_id}`,
                Key: `final-product/final_podcast_export.mp4`,
            };

            // This uses a callback to download the video once it is retrieved
            s3.getObject(params, (err:AWSError, data:GetObjectOutput) => {
                if(err){
                    throw new Error(err.statusCode?.toString());
                } else {
                    const buffer: Buffer = data.Body as Buffer;
                    const blob = new Blob([buffer], {type: data.ContentType});
                    
                    // Create a link that the function can "click" to actually download the content 
                    // Just having the data is not enough
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = params.Key;
                    link.click();
                }
            });
        } catch (e) {
            console.error('Error trying to export podcast:', e);
        }
    };


    const togglePlay = () => {
        if (isPlaying){
            setButtonText("Play");
        } else {
            setButtonText("Pause");
        }
        setIsPlaying(!isPlaying);
    };

    // Event handlers:

    /**
     * When a seek button (+5 / -5 seconds button) is pressed, actually move the video to this position
     * 
     * @param e - button click event
     */
    const handleSeekButton = (e: React.SyntheticEvent<EventTarget>) => {
        if (playerRef.current != null){
            const duration  = playerRef.current.getDuration();
            const seekFromButton : number = +((e.target as HTMLButtonElement).value);
            const newTime = seekFromButton + playerRef.current.getCurrentTime();

            if (newTime > duration && isPlaying){
                togglePlay();
            }
            playerRef.current.seekTo(newTime);
        }
    };
	

    /**
	 * Updates the time on the video when a transcript seek button is pressed
	 * This will also update the time on the waveform, if it is being used
	 *
	 * @param newTime, which the react player reference will seek to
	 */
    const handleSeekTranscript = (newTime: number) => {
        if (playerRef.current){
            playerRef.current.seekTo(newTime);
            setCurrentTime(newTime);
            setDidVideoSeek(true);
        }
    };


    const handleSeekWaveform = (newTime: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(newTime);
        }
    };

    const handleOnProgress = (e: OnProgressProps) =>  {
        setCurrentTime(parseFloat((e.playedSeconds).toFixed(2)));
    };   


    // JSX:
    const videoController = controller_type === "regular" ? (
        <div className={styles.videoControlsContainer}>
            <button onClick={handleSeekButton} value="-5">Back 5s</button>
            <button onClick={togglePlay}>{buttonText}</button>
            <button onClick={handleSeekButton} value="5">Forward 5s</button>
        </div>
    )
        : (
            <div className={styles.waveFormWrapper}>
                <div className={styles.comp}>
                Timeline
                    <WaveForm
                        setVideoTime={handleSeekWaveform} 
                        videoUrl={videoUrl} 
                        setPlaying={setIsPlaying}
                        didVideoSeek={didVideoSeek}
                        setDidVideoSeek={setDidVideoSeek}
                        currentTime={currentTime}
                    />
                </div>
            </div>
        );
    

    // Choose whether to render a loading message or the editor page
    if (!projectInfo || !videoUrl) {
        return <Loading message="Audio Synchronization  of files"/>;
    } else {
        return (
            <div className={styles.mainContainer}>
                <div id={styles.video}>
                    {videoUrl && (
                        <ReactPlayer
                            ref={playerRef}
                            url={videoUrl}
                            muted={false}
                            width="100%"
                            height="auto"
                            controls={false}
                            playing={isPlaying}
                            onSeek={(e) => console.log("onSeek",e)}
                            onProgress={(e) => handleOnProgress(e)}
                            progressInterval={1}
                        />
                    )}
                    {videoController}
                    <button onClick={exportPodcast} className={styles.exportButton}> Export Podcast </button>
                </div>
                <div id={styles.transcript}>
                    <h1>Transcript</h1>
                    <ReactPlayerContext.Provider value={{playerRef,handleSeekTranscript,isPlaying,currentTime}}>
                        <Transcript videoUrl={videoUrl} projectID={project_id}/>
                    </ReactPlayerContext.Provider>
                </div>
            </div>
        );
    }
};
export default Editor;
