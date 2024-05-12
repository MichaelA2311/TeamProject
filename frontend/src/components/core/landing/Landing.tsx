import { useState, useEffect, useRef } from 'react';

import { useNavigate,useLocation } from 'react-router-dom';
import { ProjectInfo, funcProp } from '@src/Interfaces';
import ProjectComponent from './ProjectComponent';
import Loading from '@shared/loading-animation/Loading';
import DeleteConfirmation from '@shared/delete-confirmation/DeleteConfirmation';

import { useWaitAuth0Redirect } from '@hooks/useWaitAuthoRedirect';

import AWS from 'aws-sdk';
import useUpdateLastEdited from '@src/hooks/useUpdateLastEdited';


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

const Landing = (props: funcProp) => {
 
    props.func("Team Project");

    const isLoggedIn =  useWaitAuth0Redirect('login');

    const location = useLocation();
    const {state} = location;
    let projectID;

    if (state === null){
        projectID = "0";
    } else {
        projectID = state.projectid;
    }
    useUpdateLastEdited(projectID);
    
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [isConfirmationOpen, setConfirmationOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string>('');


    const navigate = useNavigate();
    const gotoCreate = () => navigate('/create');
    const makeAPICallRef = useRef(true);

    const [isLoading,setIsLoading] = useState<boolean>(true);

    /**
     * Fetches all projects from the database by calling the Flask API
     * 
     * @returns {Promise<void>} - returns a Promise that is resolved when the project is deleted. 
     * @throws {Error} - throws an error if there is an issue fetching projects.
     */
    const fetchProjects = async (): Promise<void> => {
        try {
            const response = await fetch(process.env.REACT_APP_FLASK_API_DEVELOP + '/projects');
            if(!response.ok) {
                console.log(response);
                throw new Error(`Failed to fetch projects. Status: ${response.status.toString()}`);
            }
            const projects = await response.json(); 
            setProjects(projects);
            setIsLoading(false);
        } catch (e) {
            console.error('Error fetching projects:', e);
        }
    };

    const handleDelete = (project_id : string) => {
        setProjectToDelete(project_id);
        setConfirmationOpen(true);
    };


    /**
     * Deletes a project by calling the Flask API.
     * 
     * @param {string} project_id - the ID of the project to be deleted.
     * @returns {Promise<void>} - returns a Promise that is resolved when the project is deleted. 
     */
    const handleConfirmDelete = async (project_id: string): Promise<void> => {
        try {
            const response = await fetch(process.env.REACT_APP_FLASK_API_DEVELOP + `/delete/${project_id}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const minio_project_id = `project-${project_id}`;

            // List all objects in the bucket
            const objects = await s3.listObjectsV2({Bucket: minio_project_id}).promise() ;

            // Delete each object in the bucket
            const contents = objects.Contents ?? [];
            for (const object of contents){
                await s3.deleteObject({ Bucket: minio_project_id, Key: object.Key || '' }).promise();
            }

            // Delete the bucket itself
            await s3.deleteBucket({ Bucket: minio_project_id }).promise();
            console.log(`Bucket '${project_id}' and its contents have been deleted.`);

            setConfirmationOpen(false);

            // If successfully deleted from the API, remove the component from the frontend
            setProjects((currentProjects) =>
                currentProjects.filter((project) => project.project_id !== project_id),
            );

        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };


    useEffect(() => {
        if (makeAPICallRef.current){
            if(isLoggedIn){
                fetchProjects();
            }

            makeAPICallRef.current = false;
        }
    },[isLoggedIn, isConfirmationOpen]);



    const sortedProjects = projects.slice().sort((a, b) => {
        return new Date(b.last_edited).getTime() - new Date(a.last_edited).getTime();
    });


    if (isLoading){
        return (
            <Loading message='Loading Projects'/>
        );
    } else if (projects.length === 0) {
        return (
            <div>
                <p>No projects found...</p>
                <button onClick={gotoCreate}>Create Podcast</button>
            </div>
        );
    } else {
        return (
            <div>
                {sortedProjects.map(({ project_id, name, created_at, last_edited, size }) => {
                    return (
                        <ProjectComponent
                            key={project_id}    // React wants a unique key for each item in map
                            project_id={project_id}
                            slug={project_id} // TODO: change this to slug={slug} when slug feature is implemented
                            name={name} 
                            created_at={created_at} 
                            last_edited={last_edited}
                            size={size} 
                            onDelete={() => handleDelete(project_id)}/>
                    );
                })}
                <button onClick={gotoCreate}>Create Podcast</button>
                <DeleteConfirmation
                    isOpen={isConfirmationOpen}
                    onCancelDelete={() => setConfirmationOpen(false)}
                    onConfirmDelete={() => handleConfirmDelete(projectToDelete)}
                    deletelocation='project'
                />
            </div>
        );
    }

};

export default Landing;
