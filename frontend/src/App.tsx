import { useState } from 'react';

import {
    BrowserRouter as Router,
    Routes,
    Route,
} from 'react-router-dom';

import globalStyles from './App.module.css';

import Landing from '@core/landing/Landing';
import Editor from '@core/editor/Editor';
import CreatePodcast from '@core/create-project/CreatePodcast';

import Navbar from '@shared/navigation-bar/Navbar';

import Login from '@features/log-in/Login';

function App() {

    const [navbarTitle, setNavbarTitle] = useState("Team Project");

    const updateNavbarTitle = (data: string) => {
        setNavbarTitle(data);
    };

    const [showNavBar,setShowNavBar] = useState(true);

    const disableNavBar = () => {
        setShowNavBar(false);
    };

    return (
        <div className={globalStyles.App}>
            <Router>
                {showNavBar && <Navbar title={navbarTitle}></Navbar>}
                <div className={globalStyles.mainContent}>
                    <Routes>
                        <Route path="/" element={<Landing func={updateNavbarTitle} />} />
                        <Route path="editor/:controller_type/:project_id" element={<Editor func={updateNavbarTitle} />} />
                        <Route path="create" element={<CreatePodcast />} />
                        <Route path="login" element={<Login  removeNavBar={disableNavBar} />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
