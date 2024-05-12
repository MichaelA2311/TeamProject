import { removeNavBarFuncProp } from "@src/Interfaces";

import styles from './Login.module.css';

import logo from '@static/logo.png';

import { useAuth0 } from "@auth0/auth0-react";

const Login = (props : removeNavBarFuncProp) => {
    props.removeNavBar();

    const {loginWithRedirect,isLoading} = useAuth0();

    const handleButtonClick = async () => {
        if (!isLoading){
            await loginWithRedirect({
                appState: {returnTo : "/",
                },
                authorizationParams: {screen_hint: "signup",
                },
            });
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div id={styles.header}>
                <h1>Minimise Your Time</h1>
                <h1>Magnify Your Impact</h1>
            </div>
            <div id={styles.login}>
                <div className={styles.logoArea}>
                    <img className={styles.logo} alt="Logo" src={logo} />
                </div>
                <div className={styles.CredentialsArea}>
                    <p className={styles.SignInLabel}>Sign Up to get started.</p>
                </div>
                <div className={styles.ButtonArea}>
                    <button className={styles.SignUpButton} onClick={handleButtonClick}>Get Started</button>
                </div>
            </div>
        </div>
    );
};

export default Login;
