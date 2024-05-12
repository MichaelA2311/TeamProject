import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import Landing from "@core/landing/Landing";

// Mock the react-modal module
jest.mock('react-modal', () => ({
    setAppElement: jest.fn(),
    // Other modal-related functions or components can be mocked here
}));

describe('fetchProjects', () => {
    beforeEach(() => {
        jest.spyOn(global, "fetch").mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue([
                {
                    created_at: "Thu, 18 Jan 2024 15:07:03 GMT",
                    description: null,
                    last_edited: "Thu, 18 Jan 2024 23:57:47 GMT",
                    name: "Project 1",
                    project_id: 1,
                    size: 15,
                },
                {
                    created_at: "Sun, 14 Jan 2024 18:52:35 GMT",
                    description: "Description 2",
                    last_edited: "Wed, 17 Jan 2024 14:22:24 GMT",
                    name: "Project 2",
                    project_id: 2,
                    size: 20,
                },
                {
                    created_at: "Sun, 14 Jan 2024 18:52:35 GMT",
                    description: "I hate JS",
                    last_edited: "Sun, 21 Jan 2024 02:59:53 GMT",
                    name: "Project 3",
                    project_id: 3,
                    size: 50,
                },
            ]),
        } as unknown as Response); // I am sorry 
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test("create podcast link goes to create podcast", async () => {

        const history = createMemoryHistory();
        history.push = jest.fn();
        render(
            <Router location={history.location} navigator={history}>
                <Landing func={jest.fn()} />
            </Router>,
        );

        expect((await screen.findByText('Create Podcast'))).toBeVisible();

        fireEvent.click(screen.getByText(/Create Podcast/i));

        expect(history.push).toHaveBeenCalledWith(
            {
                hash: '',
                pathname: '/create',
                search: '',
                preventScrollReset: undefined,
            },
            undefined,
            {},
        );
    });
});
