
import { useEffect, useState } from 'react';
import { GiTwoCoins } from 'react-icons/gi'
import { FaCopy } from 'react-icons/fa'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from './Others/TabPanel'
import UserTransactions from './Transactions/UserTransactions';
import { getAcctType } from './Others/GetAcctType';
import { getAddressUTXO } from './Transactions/UTXO';
import { getUserTx } from './Transactions/GetUserTx';
import { notify } from './Others/Notify';
import { COIN_NAME } from './Strings';
import { roundAmount } from './Others/GetDate';

const coinToDollar = 2;

export default function Dashboard({ user }) {
    const address = user.is.pub;
    const [username, setUsername] = useState('');
    const [acctType, setAcctType] = useState(false);
    const [currency, setCurrency] = useState('inr');
    const [exchangeRate, setExchangeRate] = useState(null);
    const [amount, setAmount] = useState('');
    const [userUTXO, setUserUTXO] = useState({});
    const [totalUTXO, setTotalUTXO] = useState();
    const [myTx, setMyTx] = useState({})
    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (acctType === true || acctType === false)
            updateDet();

        async function updateDet() {
            setAcctType(await getAcctType(acctType))
        }

    }, [acctType])

    useEffect(() => {
        async function fetchData() {
            const getExchange = await fetch('http://www.floatrates.com/daily/usd.json')
            const exchangeValue = await getExchange.json()
            setExchangeRate(exchangeValue)
            setUsername(await user.get('alias'))
            getAddressUTXO(user.is.pub).then((UTXO) => {
                setUserUTXO(UTXO[0])
                setTotalUTXO(UTXO[1])
            });
            const tempUserTx = await getUserTx(address)
            setMyTx(tempUserTx[0])
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (totalUTXO >= 0) {
            changeCurrency('inr')
            setLoading(false)
        }
    }, [totalUTXO])

    function changeCurrency(cur) {
        let amount = totalUTXO / coinToDollar;
        if (cur !== 'usd')
            amount = Math.round(exchangeRate[cur].rate * amount);
        setAmount(<>{cur === 'inr' ? '₹' : '$'}{roundAmount(amount)}</>)
    }


    function logout() {
        setLoading(true)
        user.leave().then(() => {
            window.location.href = '/';
        })
    }
    return (
        <>
            <div className='container' style={{ width: '1800px' }}>
                {loading ?
                    <center><div className='loader'></div></center>
                    :
                    <>
                        <h4>{username}</h4>
                        <ToastContainer />
                        <Box display="flex" justifyContent="center" width="100%">
                            <Tabs value={value} onChange={handleChange}
                                TabIndicatorProps={{ style: { backgroundColor: "white" } }}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                                aria-label="scrollable force tabs example"
                                centered
                            >
                                <Tab label="Wallet" />
                                <Tab label="Transactions" />
                            </Tabs>
                        </Box>
                        <TabPanel value={value} index={0} className='tabPanel'>
                            <div style={{ width: '100%' }}>
                                <select style={{ maxWidth: 80, float: 'right' }}
                                    value={currency} onChange={(e) => {
                                        setCurrency(e.target.value)
                                        changeCurrency(e.target.value)
                                    }
                                    }>
                                    <option value={'inr'}>INR</option>
                                    <option value={'usd'}>USD</option>
                                </select>
                            </div>
                            <br />
                            <div style={{ textAlign: 'left' }}>
                                <b>Type</b>: {acctType}<br />
                                <b>{COIN_NAME}</b>: {roundAmount(totalUTXO)}<GiTwoCoins /><br />
                                <b>Amount</b>: {amount}<br />
                                <b>Address</b>: *** <FaCopy onClick={() => {
                                    navigator.clipboard.writeText(address)
                                    notify('✔️ Wallet address copied!')
                                }} /><br />
                            </div>
                        </TabPanel>
                        <TabPanel value={value} index={1} className='tabPanel'>
                            <UserTransactions myTx={myTx} UTXO={userUTXO} />
                        </TabPanel>

                    </>
                }
            </div>
            <br />
            <button style={{ background: 'red' }}
                onClick={() => logout()}>Logout</button>
        </>
    )
}