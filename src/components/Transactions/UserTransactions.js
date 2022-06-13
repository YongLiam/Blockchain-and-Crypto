import { useState } from "react"
import { FaCopy } from 'react-icons/fa'
import { Link } from "react-router-dom";
import { colors } from '../Others/Colors';
import { roundAmount } from "../Others/GetDate";
import { notify } from "../Others/Notify";
import { COIN_SYMBOL } from "../Strings";

export default function UserTransactions({ myTx, UTXO }) {
    const [filterTx, setFilterTx] = useState('utxo')

    return (
        <>
            <div style={{ width: '100%' }}>
                <select style={{ maxWidth: 80, float: 'right' }}
                    value={filterTx}
                    onChange={(e) => setFilterTx(e.target.value)}>
                    <option value={'all'}>ALL</option>
                    <option value={'utxo'}>UTXO</option>
                </select>
            </div>
            <br />
            <table>
                {filterTx === 'all' ?
                    Object.keys(myTx).length > 0 ?
                        Object.values(myTx).sort((a, b) => a.timestamp > b.timestamp ? -1 : 1).map((tx, index) => (
                            <div key={index} style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                                <tr><td>Hash</td> <td><Link to={`/tx/${tx.hash}`}>{tx.hash}</Link> <FaCopy
                                    onClick={() => {
                                        navigator.clipboard.writeText(tx.hash)
                                        notify('✔️ Transaction hash copied!')
                                    }} /></td></tr>
                                {tx.from ?
                                    <tr><td>From</td> <td><Link to={`/address/${tx.from}`}>{tx.from}</Link> <FaCopy
                                        onClick={() => {
                                            navigator.clipboard.writeText(tx.from)
                                            notify('✔️ Address copied!')
                                        }} /></td></tr>
                                    :
                                    <tr><td>To</td> <td><Link to={`/address/${tx.to}`}>{tx.to}</Link> <FaCopy
                                        onClick={() => {
                                            navigator.clipboard.writeText(tx.to)
                                            notify('✔️ Address copied!')
                                        }} /></td></tr>
                                }
                                <tr><td>Time</td> <td>{tx.timestamp}</td></tr>
                                <tr><td>Status</td> <td
                                    style={{
                                        color: isNaN(tx.block) ? 'yellow' :
                                            colors.ligthGreen
                                    }}>{isNaN(tx.block) ? 'Unconfirmed' : 'Confirmed'}</td></tr>
                                <tr> <td>Block</td>
                                    {!isNaN(tx.block) ?
                                        <td><Link to={`/block/${tx.block}`}>#{tx.block}</Link></td>
                                        :
                                        <td>{tx.block}</td>
                                    }
                                </tr>
                                <tr> <td>Confirmations</td> <td>{tx.confirmations}</td></tr>
                                <tr><td>Amount</td> <td style={{ color: tx.to ? 'red' : null }}>{roundAmount(tx.amount)} {COIN_SYMBOL}</td></tr>
                                {tx.fee ? <tr><td>Fee</td> <td style={{ color: 'red' }}>{tx.fee} {COIN_SYMBOL}</td></tr> : null}
                                {/* (total Output - change) */}
                            </div>
                        ))
                        :
                        <div style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                            <tr>Address do not have any transaction </tr>
                        </div>
                    :
                    Object.keys(UTXO).length > 0 ?
                        Object.keys(UTXO).reverse().map((key, index) => (
                            <div key={index} style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                                <tr><td>Hash</td> <td><Link to={`/tx/${key}`}>{key}</Link> <FaCopy
                                    onClick={() => {
                                        navigator.clipboard.writeText(key)
                                        notify('✔️ Transaction hash copied!')
                                    }} /></td></tr>
                                <tr><td>Amount</td> <td>{roundAmount(UTXO[key])} {COIN_SYMBOL}</td></tr>
                            </div>
                        ))
                        :
                        <div style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                            <tr>Address do not have any unspent transaction output</tr>
                        </div>
                }
            </table>
        </>
    )
}