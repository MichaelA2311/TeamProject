import { useContext, useEffect, useRef, useState } from "react";

import { TranscriptWordInfo } from "@src/Interfaces";

import styles from "./SingleWord.module.css";
import { TimeStampContext } from "./Transcript";

import { QuoteContext } from "./Quote";
import { ReactPlayerContext } from "@src/components/core/editor/Editor";


const SingleWord = ({id,start,end,text} : TranscriptWordInfo) => {

    const [menuVisibility,setMenuVisibility] = useState<boolean>(false);
    const [isCrossedOut,setIsCrossedOut] = useState<boolean>(false);
    const [tobeHighlighted,setToBeHighlighted] = useState<boolean>(false);

    const {timestamps,setTimeStamps ,timestampIndex} = useContext(TimeStampContext);

    const parentQuoteID  = useContext(QuoteContext);

    const {playerRef, handleSeekTranscript} = useContext(ReactPlayerContext);

    const updateOnce = useRef<boolean>(true);

    const updateTimeStampStatus = (newPayload: TranscriptWordInfo, newEnabled: boolean) => {
        setTimeStamps(prevStatusList => {
            const indexToUpdateIndex = prevStatusList.findIndex(status => status.index[0] === parentQuoteID && status.index[1] === id);
            if (indexToUpdateIndex !== -1) {
                return prevStatusList.map((status, index) => {
                    if (index === indexToUpdateIndex) {
                        return {
                            ...status,
                            payload: newPayload,
                            enabled: newEnabled,
                        };
                    }
                    return status;
                });
            } else {
                return [
                    ...prevStatusList,
                    {
                        index: [parentQuoteID,id],
                        payload: newPayload,
                        enabled: newEnabled,
                    },
                ];
            }
        },   
        );
    };

    
    useEffect(() => {
        if (timestamps.length !== 0 && !updateOnce.current){
            const selfIndex = timestamps.findIndex(item => item.index[0] === parentQuoteID && item.index[1] === id);
            const self = timestamps[selfIndex];
            setIsCrossedOut(!self.enabled);
        } else if (updateOnce.current) {
            updateTimeStampStatus({id,start,end,text},!isCrossedOut);
            updateOnce.current = false;
        }
    },[timestamps,isCrossedOut]);

    useEffect(() => {
        const currentWord = timestamps[timestampIndex];
        if (currentWord != undefined)
            if (currentWord.index[0] == parentQuoteID && currentWord.index[1] == id){
                setToBeHighlighted(!tobeHighlighted);
            } else {
                setToBeHighlighted(false);
            }
    },[timestampIndex]);

    const handleSeek = () => {
        if (playerRef.current != null){
            handleSeekTranscript(start);
            setMenuVisibility(!menuVisibility);
        }
    };

    const handleRemove = () => {
        updateOnce.current = true;
        setIsCrossedOut(true);
        setMenuVisibility(false);
    };

    const handleUndo = () => {
        updateOnce.current = true;
        setIsCrossedOut(false);
        setMenuVisibility(false);
    };

    const handleWordClick = () => {
        setMenuVisibility(!menuVisibility); 
    };
 

    const optionsMenu = (
        <div className={styles.optionsMenuContainer} style={menuVisibility ? {visibility: "visible"} : {visibility :"hidden"}} >
            <button className={styles.seekButton} onClick={handleSeek}>Seek</button>
            <>
                {isCrossedOut ? ( 
                    <button className={styles.removeButton} onClick={handleUndo}>Undo</button>
                ) : (
                    <button className={styles.removeButton} onClick={handleRemove}>Remove</button>
                )}
            </> 
        </div>
    );

    return (
        <div id={id as unknown as string} className={styles.word}>
            <div className={styles.menuWrapper}>
                {optionsMenu}   
            </div>
            <button className={styles.wordButton} onClick={handleWordClick} style={{textDecoration : isCrossedOut ? 'line-through' : "none",backgroundColor : tobeHighlighted ? "#bb86fc" : "gray"}}>
                {text}
            </button>
        </div>
    );

};

export default SingleWord;
