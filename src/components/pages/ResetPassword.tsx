import React, {useState} from 'react';
import api from '../../lib/LegacyApi';
import {useLocation} from 'react-router-dom';

interface ResetPasswordProps {
}

function ResetPassword(props: ResetPasswordProps) {
    const useToken = () => {
        let query = new URLSearchParams(useLocation().search);

        return query.get('t') || '';
    };

    const [messages, setMessages] = useState<string[]>([]);
    const [password, setPassword] = useState<string>('');
    const [password2, setPassword2] = useState<string>('');
    const token = useToken();

    const resetPassword = (event: any) => {
        event.preventDefault();

        clearMessages();

        if (!validateForm()) return;

        api.resetPassword(token, password)
            .then((res: any) => {
                if (res.ok) {
                    pushMessage('Password reset successfully');
                } else {
                    pushMessage('Password reset failed');
                    res.text().then((t: string) => console.log(t));
                }
            })
    };

    const pushMessage = (msg: string) => {
        setMessages([...messages, msg]);
    };

    const clearMessages = () => {
        setMessages([]);
    };

    const validateForm = () => {
        let passes = true;

        if (!password || !password2) {
            pushMessage("Please enter new password twice");
            passes = false;
        }

        if (password !== password2) {
            pushMessage("Passwords don't match");
            passes = false;
        }

        return passes;
    };


    return <form onSubmit={resetPassword}>
        <h1>Reset Password</h1>

        {messages.map((msg, i) => <p key={i}>{msg}</p>)}

        <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            name={'password'}
            placeholder={'Password'}
        /><br/>

        <input
            type="password"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            name={'password2'}
            placeholder={'Retype Password'}
        /><br/>

        <input type="submit" value={'Save new password'} />
    </form>
}

export default ResetPassword;
