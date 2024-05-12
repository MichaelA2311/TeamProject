
import styles from './ProfileView.module.css';

import { useAuth0 } from '@auth0/auth0-react';


const ProfileView = () => {

    const {logout,isAuthenticated,user,loginWithRedirect} = useAuth0();
    
    const profileIcon = user?.picture;
    const username = user?.nickname;

    const handleLogOut =  async () => {
        await logout({});
    };

    const handleLogin = async () => {
        await loginWithRedirect({
            appState: {returnTo : "/",
            },
            authorizationParams: {screen_hint: "login",
            },
        });
    };

    return(
        <div className={styles.dropDownMenu}>
            {isAuthenticated ? 
                <>
                    <img className={styles.profileIcon} src={profileIcon} alt='Profile'></img>
                    <p className={styles.username}>You are logged in as {username}</p>
                    <button className={styles.logOutButton} onClick={handleLogOut}>Log Out</button>
                </>
                :
                <>
                    <p className={styles.username}>You are not logged in</p>
                    <button className={styles.logOutButton} onClick={handleLogin}>Log In</button>
                </>
            }
        </div>
    );
};


export default ProfileView;


