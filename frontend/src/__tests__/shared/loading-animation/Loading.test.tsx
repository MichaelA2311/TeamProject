import Loading from "@shared/loading-animation/Loading";
import { render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";

test('if loading screen loads correctly with the provided message', async () => {

    const history = createMemoryHistory();
    render(
        <Router location={history.location} navigator={history}>
            <Loading message={"test Message"}/>
        </Router>,
    );

    expect(await (screen.findByText('test Message'))).toBeVisible();

});