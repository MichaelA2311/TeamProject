import styles from '@shared/file-comp/ListComponent.module.css';

import { FileInfo } from '@src/Interfaces';

import { cropString } from "@src/utils";

import audiothumbnail from "@static/audiothumbnail.png";

const FileComponent = ({name, size, file_type, thumbnail_url, onDelete }: FileInfo) => {

    const real_thumbnail_url = file_type.startsWith('audio/')
        ? audiothumbnail
        : thumbnail_url ;

    return (
        <div className={styles.listComponent}>
            <div className={styles.listComponentLeft}>
                <img src={real_thumbnail_url} className={styles.thumbnail} alt=""></img>
                <p className={styles.name}>{cropString(name, 20)}</p>
            </div>
            <div className={styles.listComponentRight}>
                <div className={styles.listComponentInfo}>
                    <p>Type: {file_type}</p>
                    <p>Size: {size}</p>
                    <button onClick={() => {
                        onDelete(name);
                    }}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default FileComponent;

