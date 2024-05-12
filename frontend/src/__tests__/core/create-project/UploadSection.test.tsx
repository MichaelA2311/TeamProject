import React from 'react';
import { render, fireEvent, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UploadSection from '@core/create-project/UploadSection';
import { UploadSectionInfo } from '@src/Interfaces';

import { it }  from "@jest/globals";

jest.mock('react-modal', () => ({
    setAppElement: jest.fn(),
    open : true, 
}));


describe('UploadSection component', () => {

    const mockProps : UploadSectionInfo = {
        id : 1,
        name : "Test Upload Area",
        uploadFile : jest.fn(),
        fileState : jest.fn(),
    };

    it('renders without crashing', () => {
        render(
            <UploadSection 
                id={mockProps.id} 
                name={mockProps.name} 
                uploadFile={mockProps.uploadFile} 
                fileState={mockProps.fileState}
            />);
    });

    it('displays correct name', () => {
        const { getByText } = render(
            <UploadSection 
                id={mockProps.id} 
                name={mockProps.name} 
                uploadFile={mockProps.uploadFile} 
                fileState={mockProps.fileState}
            />);
        expect(getByText('Test Upload Area')).toBeInTheDocument();
    });

    it('adds a file', async () => {
        const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
        const uploadFileMock = jest.fn().mockResolvedValue({
            name: 'test.mp4',
            size: 1024,
            file_type: 'video/mp4',
            thumbnail_url: 'thumbnail.jpg',
        });
        const { findByText } = render(
            <UploadSection             
                id={mockProps.id} 
                name={mockProps.name} 
                uploadFile={uploadFileMock} 
                fileState={mockProps.fileState}
            />);
      
        const fileInput = screen.getByTestId("files-area");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
        expect(uploadFileMock).toHaveBeenCalledTimes(1);
        expect(await findByText('test.mp4')).toBeInTheDocument();

        expect((await screen.findByText('Delete'))).toBeVisible();

    });
});
