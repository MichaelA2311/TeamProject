import { useEffect, useRef, useState, useCallback } from "react";
import { useWaveSurfer } from "@hooks/useWaveSurfer";
import WaveSurfer from "wavesurfer.js";
import styles from './WaveForm.module.css';

export interface WaveFormProps {
    videoUrl: string|null;
    didVideoSeek: boolean;
    currentTime: number;
    setDidVideoSeek: (seekBool: boolean) => void;
    setPlaying: (playingBool: boolean) => void;
    setVideoTime: (videoTime: number) => void;
}

const WaveForm = (props: WaveFormProps) => {
    const waveformContainerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const wavesurfer = useWaveSurfer(waveformContainerRef, props.videoUrl) as unknown as WaveSurfer;

    const onClickPlay = useCallback(() => {
        wavesurfer.playPause();
    }, [wavesurfer]);
	
    useEffect(() => {
        if (props.didVideoSeek && wavesurfer){
            wavesurfer.seekTo(props.currentTime / wavesurfer.getDuration());
            props.setDidVideoSeek(false);
        }
        return;
    }, [wavesurfer, props.didVideoSeek, props.currentTime, props.setDidVideoSeek]);

    useEffect(() => {
        if (wavesurfer) {
            const functions = [
                wavesurfer.on('play', () => {
                    setIsPlaying(true);
                    wavesurfer.setMuted(true);
                    props.setPlaying(true);
                }),
                wavesurfer.on('pause', () => {
                    setIsPlaying(false);
                    props.setPlaying(false);
                }),
                wavesurfer.on('seeking', (progress: number) => {
                    props.setVideoTime(progress);
                }),
                wavesurfer.on('finish', () => {
                    setIsPlaying(false);
                    props.setPlaying(false);
                }),
            ];

            return () => {
                functions.forEach((unsub) => unsub());
            };
        }
    }, [wavesurfer, props, props.setVideoTime, props.setPlaying, props.didVideoSeek]);

    return (
        <div id={styles.waveformContainer} ref={waveformContainerRef}>
            <button onClick={onClickPlay}>{isPlaying ? "Pause" : "Play"}</button>
        </div>
    );
};

export default WaveForm;
