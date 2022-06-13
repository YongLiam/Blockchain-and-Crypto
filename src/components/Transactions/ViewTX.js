
import { FaCopy } from 'react-icons/fa'
import { Link, useParams } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { FaReceipt } from 'react-icons/fa'
import { colors } from '../Others/Colors';
import { useEffect, useState } from 'react';
import { getLastBlock } from '../Blocks/GetLastBlock';
import { getTDate, roundAmount } from '../Others/GetDate';
import { notify } from '../Others/Notify';
import { COIN_SYMBOL } from '../Strings';

export default function ViewTX({ gun }) {
    const { txHash } = useParams();
    const [tx, setTx] = useState()
    const [txIP, setTxIP] = useState([])
    const [txOP, setTxOP] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTx()
        async function getTx() {
            let tempTx = await gun.get(`transactions/${txHash}`).then(async (tx) => {
                if (tx) {
                    let txData = {
                        hash: txHash,
                        by: {
                            adress: ''
                        },
                        status: isNaN(tx.block) ? 'Unconfirmed' : 'Confirmed',
                        timestamp: getTDate(new Date(tx.timestamp)),
                        confirmations: isNaN(tx.block) ? 0 : (await getLastBlock() - tx.block) + 1,
                        block: tx.block,
                        fee: 0,
                        totalIP: 0,
                        totalOP: 0
                    };
                    return txData
                } else
                    setTx(null)
            })
            if (tempTx) {
                setTx(tempTx)
                gun.get(`transactions/${txHash}/inputs`).once((ips) => {
                    Object.keys(ips).map((key) => {
                        if (key !== '_')
                            gun.get(`transactions/${txHash}/inputs/${key}`).once((ip) => {
                                if (key == 0)
                                    setTx(tx => ({ ...tx, by: ip }))
                                else
                                    setTxIP(txIP => [...txIP, ip])
                                if (ip.fee >= 0)
                                    setTx(tx => ({ ...tx, fee: tx.fee + ip.fee }))
                                else
                                    setTx(tx => ({ ...tx, totalIP: tx.totalIP + ip.amount }))
                            })
                    })
                })
                gun.get(`transactions/${txHash}/outputs`).then((ops) => {
                    Object.keys(ops).map((key) => {
                        if (key !== '_')
                            gun.get(`transactions/${txHash}/outputs/${key}`).once((op) => {
                                setTx(tx => ({ ...tx, totalOP: tx.totalOP + op.amount }))
                                setTxOP(txOP => [...txOP, op])
                            })
                    })
                })
            }
        }
        getTx();
    }, [txHash])

    useEffect(() => {
        if (txOP.length > 0)
            setLoading(false);
    }, [txOP])

    return (
        loading ?
            <div className='loader'></div>
            :
            tx ?
                <div style={{ width: '90%', maxWidth: '1800px' }}>
                    <ToastContainer />
                    <h4 style={{ textAlign: 'left' }}><FaReceipt color={colors.link} /> Transaction Details</h4>
                    <table style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                        <tr><td>Hash</td><td>{tx.hash} <FaCopy
                            onClick={() => {
                                navigator.clipboard.writeText(tx.hash)
                                notify('✔️ Transaction hash copied!')
                            }} /></td></tr>
                        <tr><td>By</td><td><Link to={`/address/${tx.by.address}`}>{tx.by.address}</Link> <FaCopy
                            onClick={() => {
                                navigator.clipboard.writeText(tx.by.address)
                                notify('✔️ Address copied!')
                            }} /></td></tr>
                        <tr><td>Time</td><td>{tx.timestamp}</td></tr>
                        <tr><td>Status</td><td
                            style={{
                                color: tx.status === 'Unconfirmed' ? 'yellow' : '#76ff76'
                            }}>{tx.status}</td></tr>
                        <tr> <td>Block</td>
                            {!isNaN(tx.block) ?
                                <td><Link to={`/block/${tx.block}`}>#{tx.block}</Link></td>
                                :
                                <td>{tx.block}</td>
                            }
                        </tr>
                        <tr><td>Confirmations</td>
                            <td>{tx.confirmations}</td></tr>
                        <tr><td>Total Input</td><td>{roundAmount(tx.totalIP)} {COIN_SYMBOL}</td></tr>
                        <tr><td>Total Output</td><td>{roundAmount(tx.totalOP)} {COIN_SYMBOL}</td></tr>
                        <tr><td>Fee</td><td>{tx.fee} {COIN_SYMBOL}</td></tr>
                    </table>

                    <h4 style={{ textAlign: 'left' }}>Inputs</h4>

                    {txIP.length > 0 ?
                        txIP.map((transaction, index) => (
                            <table key={index} style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                                <tr><td>Index</td> <td>{index}</td></tr>
                                <tr><td>Address</td> <td><Link to={`/tx/${transaction.address}`}>{transaction.hash}</Link> <FaCopy
                                    onClick={() => {
                                        navigator.clipboard.writeText(transaction.hash)
                                        notify('✔️ Address copied!')
                                    }} /></td></tr>
                                <tr><td>Amount</td> <td>{roundAmount(transaction.amount)} {COIN_SYMBOL}</td></tr>
                            </table>
                        ))
                        :
                        <table style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                            <tr>No input</tr>
                        </table>}

                    <h4 style={{ textAlign: 'left' }}>Outputs</h4>
                    {txOP.map((transaction, index) => (
                        <table key={index} style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                            <tr><td>Index</td> <td>{index}</td></tr>
                            <tr><td>Address</td> <td><Link to={`/address/${transaction.address}`}>{transaction.address}</Link> <FaCopy
                                onClick={() => {
                                    navigator.clipboard.writeText(transaction.address)
                                    notify('✔️ Address copied!')
                                }} /></td></tr>
                            <tr><td>Amount</td> <td>{roundAmount(transaction.amount)} {COIN_SYMBOL}</td></tr>
                        </table>
                    ))}
                </div>
                :
                'Transaction not found !'
    )
}