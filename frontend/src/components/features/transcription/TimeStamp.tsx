import { TimeStampInfo } from "@src/Interfaces";

import styles from "./TimeStamp.module.css";

import { getTime }  from "@src/utils";



const TimeStamp =  ({id,start,end} : TimeStampInfo) => {
    
    return  (
        <div id={id} className={styles.component}>
            <button>
                {getTime(start)}
            </button>
            -
            <button>
                {getTime(end)}
            </button>
        </div>

    );
};


export default TimeStamp;
