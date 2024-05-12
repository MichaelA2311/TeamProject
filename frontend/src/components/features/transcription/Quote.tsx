import { createContext, useContext } from "react";

import SingleWord from "./SingleWord";

import { TranscriptWordInfo } from "@src/Interfaces";

import styles from './Quote.module.css';

import { TimeStampContext }  from "./Transcript";
import { ReactPlayerContext } from "@src/components/core/editor/Editor";


export interface QuoteProps {
    wordArray : TranscriptWordInfo[],
    TimestampId : string
}

export const QuoteContext = createContext<number>(0);

const Quote = ({wordArray,TimestampId} : QuoteProps) => {

    const numericID = parseInt(TimestampId);

    const {timestamps,setTimeStamps,timestampIndex} = useContext(TimeStampContext);

    const {isPlaying,handleSeekTranscript,playerRef,currentTime} = useContext(ReactPlayerContext);

    const words = wordArray.map(({text,start,end} : TranscriptWordInfo,index:number) =>
        <SingleWord 
            key={index} 
            id={index} 
            start={start} 
            end={end} 
            text={text}  
        />);

    return (
        <ReactPlayerContext.Provider value={{playerRef,handleSeekTranscript,isPlaying,currentTime}}>
            <TimeStampContext.Provider value={{timestamps : timestamps,setTimeStamps : setTimeStamps, timestampIndex : timestampIndex}}> 
                <QuoteContext.Provider value={numericID}> 
                    <div id={TimestampId} className={styles.quoteContainer}> 
                        {words}
                    </div>
                </QuoteContext.Provider> 
            </TimeStampContext.Provider>
        </ReactPlayerContext.Provider>
    );
};

export default Quote;
