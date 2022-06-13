
import sha256 from 'crypto-js/sha256';
import { useEffect, useState } from 'react';
import { notify } from '../Others/Notify';
import { COIN_SYMBOL } from '../Strings';
import calculateMerkleRoot from './CalculateMerkleRoot';
import { deleteUTXO, putUTXO } from './UTXO';

const feeCharge = 0.5;
const maxAmount = 1000;

export default function SendTxWallet({ UTXO, gun, user }) {
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState(0);
    const [sortedUTXO, setSortedUTXO] = useState([]);
    const [balance, setBalance] = useState(UTXO[1]);
    const [fee, setFee] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const sorted = Object.fromEntries(
            Object.entries(UTXO[0]).sort(([, a], [, b]) => a - b)
        );
        setSortedUTXO(Object.keys(sorted))
    }, [])

    useEffect(() => {
        if (amount > maxAmount)
            setAmount(maxAmount)
        setFee((Math.round((((amount * feeCharge) / 100) + Number.EPSILON) * 10000) / 10000))
    }, [amount])

    function proceedToSendTX(toUseUTXO, ipUTXOamount, timestamp) {
        const sender = user.is.pub
        const totalCost = amount + fee
        let ip = [
            {
                address: sender,
                amount: amount,
                fee: fee
            }
        ]
        toUseUTXO[1].map((val) => {
            let ipVal = val;
            ipVal.address = sender
            ip.push(ipVal)
        })
        let op = [
            {
                address: address,
                amount: amount
            }
        ]
        let newUTXO = {}
        if (ipUTXOamount > totalCost) {
            op.push({
                address: sender,
                amount: ipUTXOamount - totalCost
            })
            newUTXO[0] = {
                address: sender,
                amount: ipUTXOamount - totalCost
            }
        }
        const tempOP = op.map((val, index) => sha256(index.toString() + val.address + (val.amount).toString()).toString())
        let tx = {
            hash: sha256(timestamp.toString() + amount.toString() + fee.toString() + calculateMerkleRoot(toUseUTXO[0]) + calculateMerkleRoot(tempOP) + sender + address).toString(),
            amount: amount,
            fee: fee,
            block: 'mempool',
            from: sender,
            to: address,
            timestamp: timestamp,
            inputs: Object.assign({}, ip),
            outputs: Object.assign({}, op)
        }
        gun.get('transactions').put({
            [tx.hash]: tx
        }).then(async () => {
            ip.shift()
            await deleteUTXO(Object.assign({}, ip))
            if (newUTXO[0])
                await putUTXO(tx.hash, newUTXO)
            notify('Success')
            setTimeout(() => window.location.href = '/dashboard', 3000)
        })
    }
    function sendTx(e) {
        e.preventDefault();
        const timestamp = + new Date();
        setLoading(true)
        let totalCost = amount + fee
        if (balance >= totalCost) {
            let tempUTXO = 0;
            let toUseUTXO = [[], []];
            for (let i = 0; i < sortedUTXO.length; i++) {
                tempUTXO += UTXO[0][sortedUTXO[i]]
                toUseUTXO[0].push(sortedUTXO[i])
                toUseUTXO[1].push({
                    hash: sortedUTXO[i],
                    amount: UTXO[0][sortedUTXO[i]]
                })
                if (tempUTXO >= totalCost) {
                    proceedToSendTX(toUseUTXO, tempUTXO, timestamp)
                    break;
                }
            }
        } else {
            notify('Insufficient balance !!!')
            setLoading(false)
        }
    }
    return (
        <form onSubmit={sendTx} className='container'>
            <h4>Send {COIN_SYMBOL}</h4>
            <span style={{ fontSize: 20 }}>Balance: {balance} RC</span>
            <div className='form-field'>
                <label>Address</label>
                <input type='text' value={address}
                    onChange={(e) => setAddress(e.target.value)} required readOnly={loading} />
            </div>
            <div className='form-field'>
                <label>Amount</label>
                <input type='number' value={amount}
                    onChange={(e) => setAmount(+e.target.value)} required readOnly={loading} />
                <div style={{ float: 'right', fontSize: 20, color: '#f0f0f0' }}>Fee: {fee}</div>
            </div>
            <div className='btn-div'>
                {loading ?
                    <div className='loader'></div>
                    :
                    <button disabled={amount > 0 && address !== '' ? false : true}
                        style={{ opacity: amount > 0 && address !== '' ? '100%' : '50%' }}
                    >Send</button>
                }
            </div>
            <div className='btn-div' style={{ fontSize: 28 }}>
                - Wallet method (fee: {feeCharge}%)-
            </div>
        </form >
    )
}