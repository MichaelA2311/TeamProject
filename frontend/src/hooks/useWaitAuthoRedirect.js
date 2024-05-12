import { useEffect, useState } from 'react';

import { useAuth0 } from "@auth0/auth0-react";

import { useNavigate } from "react-router-dom";

export function useWaitAuth0Redirect (redirectURL)  {

    const [authenticated, setAuthenticated] = useState(true);

    const {isLoading,isAuthenticated} = useAuth0();

    const navigate = useNavigate();
    
    
    useEffect(() => {
        const waitAuth0 =  async() => {
            if (await JSON.parse(process.env.REACT_APP_DEVELOPMENT)){
                // If in development mode, return early and prevent authentication from being required
                setAuthenticated(true);
                return true;
            }
            if (isLoading === false && !isAuthenticated){
                navigate(redirectURL);
                setAuthenticated(false);
                return false;
            }
        };
        waitAuth0();
    }, [isLoading,isAuthenticated,navigate,redirectURL]);
    
    return authenticated;
}