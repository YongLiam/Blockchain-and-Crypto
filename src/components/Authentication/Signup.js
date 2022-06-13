
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { colors } from '../Others/Colors';
import './Style.css'

export default function SignUp({ user, gun }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [acctType, setAcctType] = useState('normal');
    const [loading, setLoading] = useState(false);
    const [invalidAuth, setInvalidAuth] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user.is)
            navigate("/dashboard");
    })

    function signup(e) {
        e.preventDefault();
        setLoading(true)
        setInvalidAuth(false)
        user.create(username, password, (ack) => {
            setLoading(false)
            if (ack.err)
                setInvalidAuth(ack.err)
            else {
                gun.user(ack.pub).get('info').put({
                    acctType: acctType
                }).then(async () => {
                    if (acctType === 'miner') {
                        gun.get('miners').put({
                            [ack.pub]: true
                        }).then(() => window.location.href = '/login')

                    }
                    else
                        window.location.href = '/login'
                })
            }
        })
    }

    return (
        <form onSubmit={signup} className='container'>
            <h4>JOIN</h4>
            <div className='form-field'>
                <label>Username</label>
                <input type='text' value={username}
                    onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className='form-field'>
                <label>Password</label>
                <input type={'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className='form-field' style={{ width: '95%', }}>
                <label>Join as?</label>
                <select value={acctType} onChange={(e) => setAcctType(e.target.value)}>
                    <option value={'normal'}>💸 Normal</option>
                    <option value={'miner'}>⛏️ Miner</option>
                </select>
            </div>
            <div className='btn-div'>
                {loading ?
                    <div className='loader'></div>
                    :
                    <button>Join</button>
                }
            </div>
            <div className='btn-div' style={{ fontSize: 20, color: colors.link }}>
                {invalidAuth ?
                    invalidAuth
                    :
                    null
                }
            </div>
            <div className='btn-div' style={{ fontSize: 28 }}>
                Have an account? <Link to='/login'>login here</Link>
            </div>
        </form>
    )
}