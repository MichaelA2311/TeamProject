import { useNavigate,useLocation } from 'react-router-dom';

import styles from './Navbar.module.css';

import ProfileView from '@features/log-in/ProfileView';


import logo from '@static/logo.png';
import profile from '@static/account.png';
import { useState } from 'react';

import { NavbarProps } from "@src/Interfaces";

const Navbar: React.FC<{ title: string }> = ({ title } : NavbarProps ) => {
    const navigate = useNavigate();
    const handleClick = () => navigate('/', { state: { "projectid": projectID }});

    const [showPorfile,setShowProfile] = useState(false);

    const location = useLocation();

    const brokenDownURL = location.pathname.split('/');
    const projectID = brokenDownURL.pop();
    const handleProfileClick = () => {
        setShowProfile((prevshowProfile) => !prevshowProfile);
    };

    return (
        <div className={styles.navContainer}>
            <img className={styles.navLogo} alt="Logo" src={logo} onClick={handleClick} />
            <h1 className={styles.TitleText}>{title}</h1>
            <img className={styles.navBackgroundAccount} alt="Account" src={profile} onClick={handleProfileClick}/>
            {showPorfile && <div className={styles.ProfileViewContainer}><ProfileView /></div>}
        </div>
    );
};

export default Navbar;
