import React, {useEffect, useState} from 'react';
import Api from '../../../classes/Api';
import Toaster from "../../../classes/Toaster";

interface CheckoutSession {
    id: string
}

interface RegisterProps {
    api: Api
}

const Register = (props: RegisterProps) => {
    const [name, setName] = useState<string>(''),
        [email, setEmail] = useState<string>(''),
        [password, setPassword] = useState<string>(''),
        [password2, setPassword2] = useState<string>(''),
        [timezones, setTimezones] = useState<string[]>([]),
        [timezone, setTimezone] = useState<string>(''),
        [agreed, setAgreed] = useState<boolean>(false),
        [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);

    const toaster: Toaster = new Toaster();

    useEffect(() => {
        populateTimezones();
        loadCheckoutSession();
    }, []);

    const populateTimezones = () => {
        props.api.getTimezones()
            .then((res: any) => res.json())
            .then((data) => {
                setTimezones(data);
                setTimezone(data[0]);
            });
    };

    const loadCheckoutSession = () => {
        props.api.getCheckoutSession()
            .then((res: any) => res.json())
            .then((session) => setCheckoutSession(session));
    };

    const register = (event: any) => {
        event.preventDefault();

        console.log('registering');

        const passes = validateRegistrationForm();

        if (!passes) return;

        console.log('posting registration');

        props.api.register(
            name,
            email,
            password,
            timezone,
            getSessionId(),
        )
            .then((res: any) => {
                if (res.ok) {
                    toaster.send('Redirecting...')
                } else {
                    toaster.send('Registration failed')
                }
                return res.json()
            })
            .then(res => {
                console.log(res);
            });

        redirect();
    };

    const redirect = () => {
        if (checkoutSession == null) return;

        const stripe = window.Stripe(window.stripe_key);

        stripe.redirectToCheckout({
            sessionId: getSessionId()
        }).then((result: any) => {
            // If `redirectToCheckout` fails due to a browser or network
            // error, display the localized error message to your customer
            // using `result.error.message`.
            toaster.send(result.error.message);

            console.log('Checkout redirect error');
            console.log(result);
        });
    };

    const getSessionId = () => {
        if (checkoutSession == null) return null;

        return checkoutSession.id;
    };

    const validateRegistrationForm = () => {
        let passes = true;

        if (!email) {
            toaster.send("Email missing");
            passes = false;
        }

        if (!password || !password2) {
            toaster.send("Please enter password twice");
            passes = false;
        }

        if (password !== password2) {
            toaster.send("Passwords don't match");
            passes = false;
        }

        if (!agreed) {
            toaster.send("Please agree before submitting");
            passes = false;
        }

        return passes;
    };

    return <form onSubmit={register}>
        <h1>Register</h1>

        <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            name={'name'}
            placeholder={'Name'}
        /><br/>

        <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            name={'email'}
            placeholder={'Email'}
        /><br/>

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

        <select name="timezone" value={timezone} onChange={e => setTimezone(e.target.value)}>
            {timezones.map((tz, i) => <option value={tz} key={i}>{tz}</option>)}
        </select><br/>

        <p>
            <label>
                <input type="checkbox" value={"yes"} onChange={e => {
                    setAgreed(e.target.value === "yes")
                }}/>
                &nbsp;I have read and agree to TaskRatchet's <a href="https://taskratchet.com/privacy/" target={"_blank"}>privacy policy</a> and <a href="https://taskratchet.com/terms/" target={"_blank"}>terms of service</a>.
            </label>
        </p>

        <p>Pressing the button below to be redirected to our payments provider to add your payment method.</p>

        <input type="submit" value={'Add payment method'} disabled={checkoutSession == null}/>
    </form>
}

export default Register;