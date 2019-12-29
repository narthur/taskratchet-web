import React from 'react';
import Api from '../../../Api';
import './style.css'

interface AccountProps {
}

interface AccountState {
    messages: string[],
    name: string,
    email: string,
    oldPassword: string,
    password: string,
    password2: string,
    timezones: string[],
    timezone: string,
}

class Account extends React.Component<AccountProps, AccountState> {
    state: AccountState = {
        messages: [],
        name: '',
        email: '',
        oldPassword: '',
        password: '',
        password2: '',
        timezones: [],
        timezone: '',
    };

    api: Api = new Api();

    componentDidMount(): void {
        this.populateTimezones();
        this.loadUser();
    }

    populateTimezones = () => {
        this.api.getTimezones()
            .then((res: any) => res.json())
            .then((data) => {
                this.setState((prev: AccountState) => {
                    prev.timezones = data;
                    return prev;
                });
            });
    };

    loadUser = () => {
        this.api.getMe()
            .then((res: any) => res.json())
            .then(this.loadResponseData)
    };

    loadResponseData = (data: any) => {
        this.setState((prev: AccountState) => {
            prev.name = data['name'];
            prev.email = data['email'];
            prev.timezone = data['timezone'];
            return prev;
        })
    };

    setName = (event: any) => {
        const t = event.target;
        this.setState((prev: AccountState) => {
            prev.name = t.value;
            return prev;
        })
    };

    setEmail = (event: any) => {
        const t = event.target;
        this.setState((prev: AccountState) => {
            prev.email = t.value;
            return prev;
        })
    };

    setOldPassword = (event: any) => {
        const t = event.target;
        this.setState((prev: AccountState) => {
            prev.oldPassword = t.value;
            return prev;
        })
    };

    setPassword = (event: any) => {
        const t = event.target;
        this.setState((prev: AccountState) => {
            prev.password = t.value;
            return prev;
        })
    };

    setPassword2 = (event: any) => {
        const t = event.target;
        this.setState((prev: AccountState) => {
            prev.password2 = t.value;
            return prev;
        })
    };

    setTimezone = (event: any) => {
        const t = event.target;
        this.setState((prev: AccountState) => {
            prev.timezone = t.value;
            return prev;
        })
    };

    saveGeneral = (event: any) => {
        event.preventDefault();

        const name = this.prepareValue(this.state.name),
            email = this.prepareValue(this.state.email),
            timezone = this.prepareValue(this.state.timezone);

        this.api.updateMe(name, email, timezone)
            .then((res: any) => {
                if (res.ok) {
                    this.pushMessage('Changes saved');
                } else {
                    this.pushMessage('Something went wrong');
                }
                return res.json();
            })
            .then(this.loadResponseData);
    };

    prepareValue = (value: string) => {
        return (value === '') ? null : value;
    };

    savePassword = (event: any) => {
        event.preventDefault();

        if (!this.isPasswordFormValid()) return;

        this.api.updatePassword(this.state.oldPassword, this.state.password)
            .then((res: any) => {
                if (res.ok) {
                    this.pushMessage('Password saved');
                } else {
                    this.pushMessage('Something went wrong');
                }
            });
    };

    isPasswordFormValid = () => {
        let passed = true;

        if (this.state.oldPassword === '') {
            this.pushMessage('Old password required');
            passed = false;
        }

        if (this.state.password === '') {
            this.pushMessage('New password required');
            passed = false;
        }

        if (this.state.password !== this.state.password2) {
            this.pushMessage('New password fields don\'t match');
            passed = false;
        }

        return passed;
    };

    pushMessage = (msg: string) => {
        this.setState((prev: AccountState) => {
            prev.messages.push(msg);
            return prev;
        });
    };

    render() {
        return <div className={'page-account'}>
            <h1>Account</h1>

            {this.state.messages.map((msg, i) => <p key={i}>{msg}</p>)}

            <form onSubmit={this.saveGeneral}>
                <input
                    type="text"
                    value={this.state.name}
                    onChange={this.setName}
                    name={'name'}
                    placeholder={'Name'}
                /><br/>

                <input
                    type="email"
                    value={this.state.email}
                    onChange={this.setEmail}
                    name={'email'}
                    placeholder={'Email'}
                /><br/>

                <select name="timezone" value={this.state.timezone} onChange={this.setTimezone}>
                    {this.state.timezones.map((tz, i) => <option value={tz} key={i}>{tz}</option>)}
                </select><br/>

                <input type="submit" value={'Save'}/>
            </form>

            <h2>Reset Password</h2>

            <form onSubmit={this.savePassword}>
                <input
                    type="password"
                    value={this.state.oldPassword}
                    onChange={this.setOldPassword}
                    name={'old_password'}
                    placeholder={'Old Password'}
                /><br/>

                <input
                    type="password"
                    value={this.state.password}
                    onChange={this.setPassword}
                    name={'password'}
                    placeholder={'Password'}
                /><br/>

                <input
                    type="password"
                    value={this.state.password2}
                    onChange={this.setPassword2}
                    name={'password2'}
                    placeholder={'Retype Password'}
                /><br/>

                <input type="submit" value={'Save'}/>
            </form>
        </div>
    }
}

export default Account;
