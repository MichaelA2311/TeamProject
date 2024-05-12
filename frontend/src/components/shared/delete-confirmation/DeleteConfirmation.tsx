/* eslint-disable react/prop-types */
import Modal from 'react-modal';

import { DeleteConfirmationProps } from '@src/Interfaces';

import styles from "./DeleteConfirmation.module.css";

Modal.setAppElement('#root');

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
    isOpen, 
    onConfirmDelete, 
    onCancelDelete,
    deletelocation,
}) => {

    if (!isOpen) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onCancelDelete}
            className={styles.modalContent}
            overlayClassName={styles.modalOverlay}
        >
            <div>
                <p>Are you sure you want to delete this {deletelocation}?</p>
                <div className={styles.confirmationButtons}>
                    <button onClick={onCancelDelete}>Cancel</button>
                    <button onClick={onConfirmDelete}>Confirm</button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteConfirmation;
