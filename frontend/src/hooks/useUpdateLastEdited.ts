import { useEffect, useRef } from "react";

const useUpdateLastEdited = (project_id: string | undefined) => {

    const callOnce = useRef<boolean>(true);

    const API_ENDPOINT = process.env.REACT_APP_FLASK_API_DEVELOP;

    const updateLastEdited = async () => {
        if (project_id === undefined){
            project_id = "0";
        }
        const integer = parseInt(project_id);
        if (isNaN(integer) || integer <= 0){
            return;
        }
        try {
            const response = await fetch(`${API_ENDPOINT}/update/${project_id}`);
            if(!response.ok) {
                throw new Error(`Failed to update last edited. Status: ${response.status.toString()}`);
            } 
        } catch (e) {
            console.error('Error updating last edited:', e);
        }
    };

    useEffect(() => {
        if (callOnce.current){
            if (project_id) {
                updateLastEdited();
            }
            callOnce.current = false;
        }
    },[]);
}; 

export default useUpdateLastEdited;