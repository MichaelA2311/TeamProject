import { useState, useEffect } from "react";

import WaveSurfer from "wavesurfer.js";


export function useWaveSurfer(containerRef, videoUrl) {
    const [wavesurfer, setWavesurfer] = useState(null);
    useEffect(() => {
        if (containerRef.current != null) {
            const wavesurfer = WaveSurfer.create({
                autoScroll: true,
                waveColor: '#01C1FF',
                progressColor: '#6DDBFF',
                cursorColor: '#c8a2c8',
                barWidth: 3,
                barHeight: 0.8,
                url: videoUrl,
                normalise: true,
                height: 80,
                container: containerRef.current,
                fillParent:true,
            });

            setWavesurfer(wavesurfer);

            return () => {
                wavesurfer.destroy();
            };
        }

    }, [containerRef]);

    return wavesurfer;
}
