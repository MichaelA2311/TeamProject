export interface FileInfo {
    name: string;
    size: string;
    file_type: string;
    thumbnail_url: string;
    onDelete: (slug: string) => void;
}

export interface ProjectInfo {
    project_id: string;
    slug: string;
    name: string;
    created_at: string;
    last_edited: string;
    size: string;
    onDelete: (slug: string) => void;
}

export interface funcProp {
    func: (data: string) => void;
}

export interface TranscriptWordInfo {
    id: number;
    start: number;
    end: number;
    text: string;
}

export interface TimeStampInfo {
    id: string;
    start: number;
    end: number;
}

export interface removeNavBarFuncProp{
    removeNavBar: () => void;
}

export interface OptionsInfo {
    chosen: string;
    optionType: string;
    handleChange: () => void;
}

export interface NavbarProps {
    title: string;
}

export interface PodcastSectionProps {
    uploadFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<FileInfo|null>;
}

export interface PodcastSectionMinioManagement {
    participantFiles: (projectBucketName : string,s3 : AWS.S3,tempBucket : string) => Promise<void>;
}

export interface PodcastSectionInfo {
    id: number;
    name: string;
    files : File[]
}

export interface UploadSectionInfo {
    id: number;
    name: string;
    uploadFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<FileInfo|null>;
    fileState : (id : number, file : File) => void;
}

export interface DeleteConfirmationProps {
    isOpen: boolean;
    onConfirmDelete: () => void;
    onCancelDelete: () => void;
    deletelocation: string;
}

export interface TranscriptProps {
    videoUrl: string; 
    projectID: string | undefined;
}