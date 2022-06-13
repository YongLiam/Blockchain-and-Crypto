import { useEffect, useState } from 'react';
import SendTxWallet from './SendTxWallet';
import SendTxManual from './SendTxManual';
import { getAddressUTXO } from './UTXO';
import { ToastContainer } from 'react-toastify';

export default function SendTx({ user, gun }) {
    const [UTXO, setUTXO] = useState([]);
    const [sendMethod, setSendMethod] = useState('');

    useEffect(() => {
        setUTXO([])
        async function getUserTx() {
            const userUTXO = await getAddressUTXO(user.is.pub);
            setUTXO(userUTXO)
        }
        getUserTx()
    }, [sendMethod])

    return (
        <>
            <ToastContainer />
            {sendMethod === '' ?
                <div className='container'>
                    Select send method
                    <br />
                    <select value='' onChange={(e) => setSendMethod(e.target.value)}>
                        <option value='' disabled>Send method ?</option>
                        <option value='wallet'>Wallet</option>
                        <option value='manual'>Manual</option>
                    </select>
                </div>
                :
                sendMethod === 'manual' ?
                    <SendTxManual UTXO={UTXO[0]} gun={gun} user={user} />
                    :
                    <SendTxWallet UTXO={UTXO} gun={gun} user={user} />
            }
        </>
    )
}