import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter }  from "react-router-dom";
import Navbar from "@shared/navigation-bar/Navbar";

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

test('if the navbar loads correctly and routes to the correct places', () => {
    render(
        <MemoryRouter>
            <Navbar title={"test title"}/>
        </MemoryRouter>,
    );


    expect(screen.getByRole('heading')).toHaveTextContent('test title');

    userEvent.click(screen.getByAltText("Logo"));
    
    expect(mockNavigate).toHaveBeenCalledWith("/", {"state": {"projectid": ""}});

});
