import { OptionsInfo } from "@src/Interfaces";

import styles from "./EditorOption.module.css";

const EditorOption:React.FC<OptionsInfo> = ({chosen, optionType, handleChange} : OptionsInfo) => {
    const isChosen = chosen === optionType.toLowerCase();
    return (
        <div className={styles.options} id={isChosen ? styles.selectedOptions : ``}>
            <label>
                <input type="checkbox" checked={isChosen} onChange={handleChange}/> {optionType} Editing
            </label>
        </div>
    );
};

export default EditorOption;
