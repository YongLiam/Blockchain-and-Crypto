import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsCheckLg } from 'react-icons/bs'
import { BiErrorCircle } from 'react-icons/bi'
import { GiCancel } from 'react-icons/gi'
import { IoMdCube } from 'react-icons/io'
import { FaReceipt } from 'react-icons/fa'
import { ToastContainer } from 'react-toastify';
import { colors } from '../Others/Colors';
import { getAcctType } from '../Others/GetAcctType';
import { getTDate } from '../Others/GetDate';
import { notify } from '../Others/Notify';
import { COIN_SYMBOL } from '../Strings';

const AUTHORIZED_TYPE = 'miner';

export default function UnconfirmedTX({ user, gun }) {
    const [loading, setLoading] = useState(true)
    const [acctType, setAcctType] = useState(false);
    const [mempool, setMempool] = useState()
    const [txLoading, setTxLoading] = useState({})
    const [candidateBlockTx, setCandidateBlockTx] = useState([])
    const [candidateBlock, setCandidateBlock] = useState(null)

    const navigate = useNavigate()
    useEffect(() => {
        setLoading(true)
        setMempool()
        if (user.is)
            gun.get(`miners/${user.is.pub}`).once((val) => {
                if (val.candidateBlock)
                    gun.get(`miners/${user.is.pub}/candidateBlock`).once((cb) => setCandidateBlock(cb))
            })
        gun.get('transactions').once((txs) => {
            if (txs) {
                let utx = [];
                Object.keys(txs).map((key) => {
                    if (key !== '_' && txs[key])
                        gun.get(`transactions/${key}`).once((tx) => {
                            if (isNaN(tx.block))
                                utx.push({
                                    hash: tx.hash,
                                    timestamp: getTDate(new Date(tx.timestamp)),
                                    amount: tx.amount,
                                    fee: tx.fee
                                })
                            setTxLoading(txLoading => ({ ...txLoading, [tx.hash]: false }))
                        })
                })
                utx.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
                setMempool(utx)
            }
            else
                setMempool([])
        })
    }, [])

    useEffect(() => {
        if (mempool)
            setLoading(false)
    }, [mempool])

    useEffect(() => {
        if (user.is && (acctType === true || acctType === false))
            updateDet()
        async function updateDet() {
            setAcctType(await getAcctType(acctType))
        }
    }, [acctType])

    function addTxToBlock(txHash, index) {
        setTxLoading(txLoading => ({ ...txLoading, [txHash]: true }))
        setCandidateBlockTx(candidateBlockTx => [...candidateBlockTx, txHash],
            setTxLoading(txLoading => ({ ...txLoading, [txHash]: false })))
    }

    function removeTxFromBlock(txHash, index) {
        setTxLoading(txLoading => ({ ...txLoading, [txHash]: true }))
        setCandidateBlockTx(candidateBlockTx.filter(newTxHash => newTxHash !== txHash),
            setTxLoading(txLoading => ({ ...txLoading, [txHash]: false })))
    }

    return (
        <>
            <ToastContainer />
            {loading ?
                <center><div className='loader'></div>
                    <div style={{ fontStyle: 'italic', fontSize: 18 }}>Getting transactions...</div></center>
                :

                <div className='blocks-table'>
                    <div style={{ width: '100%', display: 'flex' }}>
                        <h4 style={{ textAlign: 'left', flex: 1, marginLeft: '5%' }}><FaReceipt color={colors.link} /> Unconfirmed Transactions</h4>
                        {acctType === AUTHORIZED_TYPE ? <h4 style={{ textAlign: 'right', marginRight: '5%' }}>
                            <IoMdCube onClick={() => navigate('/me/block', { state: candidateBlockTx })} /></h4>
                            :
                            null
                        }
                    </div>
                    {mempool.length > 0 ?
                        <table style={{ margin: 'auto', width: '90%' }}>
                            <thead>
                                <tr style={{ display: 'contents' }}>
                                    <th scope="col">Hash</th>
                                    <th scope="col">Timestamp</th>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Fee</th>
                                    {acctType === AUTHORIZED_TYPE ? <th scope="col">CB</th> : null}
                                </tr>
                            </thead>

                            <tbody>
                                {mempool.map((utx, i) => (
                                    <tr key={i}>
                                        <td data-label="Hash"><Link to={`/tx/${utx.hash}`}>{utx.hash}</Link></td>
                                        <td data-label="Timestamp">{utx.timestamp}</td>
                                        <td data-label="Amount">{utx.amount} {COIN_SYMBOL}</td>
                                        <td data-label="Fee">{utx.fee} {COIN_SYMBOL}</td>
                                        {acctType === AUTHORIZED_TYPE ?
                                            <td data-label="CB" style={{ cursor: 'pointer' }}>
                                                {candidateBlock !== null ?
                                                    txLoading[i] ? <div className='loader'></div> :
                                                        candidateBlockTx.includes(utx.hash) ?
                                                            <GiCancel color='red' onClick={() => removeTxFromBlock(utx.hash, i)} />
                                                            :
                                                            <BsCheckLg color={colors.ligthGreen} onClick={() => addTxToBlock(utx.hash, i)} />
                                                    :
                                                    <BiErrorCircle color={colors.ligthGreen} onClick={() => notify('You need to create block first!')} />
                                                }
                                            </td>
                                            :
                                            null
                                        }
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table>
                        :
                        'No unconfirmed transaction'
                    }
                </div>
            }
        </>
    )
}