import { render, screen, fireEvent } from "@testing-library/react";
import { Router } from "react-router-dom";
import { createMemoryHistory } from 'history';
import { sizeConversion } from "@src/utils";

import ProjectComponent from "@core/landing/ProjectComponent";

const onDeleteMock = jest.fn();

test('correct stuff is shown in component', () => {

    const sampleData = { 
        project_id: "1",
        slug: "a", 
        name: "Project A",
        created_at: new Date(Date.now()).toString(),
        last_edited: new Date(Date.now()).toString(),
        size: 15000,
    };
    const history = createMemoryHistory();
    history.push = jest.fn();

    render(
        <Router location={history.location} navigator={history}>
            <ProjectComponent 
                project_id={sampleData.project_id}
                slug={sampleData.slug}
                name={sampleData.name}
                created_at={sampleData.created_at}
                last_edited={sampleData.last_edited}
                size={sizeConversion(sampleData.size)}
                onDelete={onDeleteMock}
            />
        </Router>,
    );

    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project size: 15.00KB')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(/Project A/i));
    expect(history.push).toHaveBeenCalledWith(
        {
            hash: '',
            pathname: '/editor/regular/a',
            search: '',
            preventScrollReset: undefined,
        },
        undefined,
        {
            preventScrollReset: undefined,
            relative: undefined,
            replace: false,
            state: undefined,
        },
    );

});
