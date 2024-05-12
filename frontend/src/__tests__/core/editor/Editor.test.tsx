import { render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";

import { afterEach } from "@jest/globals";

import Editor from "@src/components/core/editor/Editor";


jest.mock('react-modal', () => ({
    setAppElement: jest.fn(),
    // Other modal-related functions or components can be mocked here
}));

describe('Editor', () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    test("if editor loads in", async () => {

        const history = createMemoryHistory();
        history.push = jest.fn();
        render(
            <Router location={history.location} navigator={history}>
                <Editor func={jest.fn()} />
            </Router>,
        );
        expect((await screen.findByText('Loading'))).toBeVisible();

        expect((await screen.findByText('Audio Synchronization of files'))).toBeVisible();

    });

});


