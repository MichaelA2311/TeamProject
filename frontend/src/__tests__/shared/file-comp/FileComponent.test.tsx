import { render, screen } from "@testing-library/react";
import { createMemoryHistory } from 'history';
import FileComponent from "@shared/file-comp/FileComponent";
import { sizeConversion} from "@src/utils";
import thumbnail from '@static/thumbnail1.png';


test('Component is created with correct contents, as defined in sampleData', () => {

    const sampleData = { 
        name: "Project A",
        size: sizeConversion(15000),
        file_type: "project",
        thumbnail: thumbnail,
        onDelete : () => {},
        
    };
    const history = createMemoryHistory();
    history.push = jest.fn();

    render(
        <FileComponent 
            name={sampleData.name}
            size={sampleData.size}
            file_type={sampleData.file_type}
            thumbnail_url={sampleData.thumbnail}
            onDelete={sampleData.onDelete}
        />,
    );

    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Size: 15.00KB')).toBeInTheDocument();
    
});
