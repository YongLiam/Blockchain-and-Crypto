import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { getAcctType } from '../Others/GetAcctType';
import { putAllUTXO } from "../Transactions/UTXO";
import { addToBC } from "../Blocks/AddBlockToBC";
import { confirmTx } from "../Transactions/PutUserTx";

export default function ValidateBlock({ gun, user }) {

    const [validateLoading, setValidateLoading] = useState({})
    const [loading, setLoading] = useState(true)
    const [validationTracker, setValidationTracker] = useState(false)
    const [pendingBlocks, setPendingBlocks] = useState()
    const [acctType, setAcctType] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        setLoading(true)
        setPendingBlocks()
        gun.get('pending-blocks').once((blocks) => {
            setPendingBlocks({})
            if (blocks) {
                Object.keys(blocks).map((key) => {
                    if (key !== '_' && blocks[key]) {
                        gun.get('pending-blocks').get(key).then((block) => {
                            gun.get(`pending-blocks/${key}/coinBase`).once((cb) => {
                                block.coinBaseTx = cb
                            })
                            gun.get(`pending-blocks/${key}/transactions`).once((tx) => {
                                if (tx)
                                    block.txsTemp = Object.keys(tx).map((bTx) => {
                                        if (bTx !== '_')
                                            return tx[bTx]
                                    });
                                else
                                    block.txsTemp = []
                            })
                            gun.get(`pending-blocks/${key}/accepted`).once((accepted) => {
                                if (!accepted || !accepted[user.is.pub]) {
                                    gun.get(`pending-blocks/${key}/rejected`).once((rejected) => {
                                        if (!rejected || !rejected[user.is.pub]) {
                                            block.key = key;
                                            block.fee = 0;
                                            gun.get(`pending-blocks/${key}/transactions`).once((txs) => {
                                                block.txs = [];
                                                if (txs) {
                                                    Object.values(txs).map((key) => {
                                                        if (key !== '_') {
                                                            gun.get(`transactions/${key}`).once(async (tx) => {
                                                                let tempTx = {
                                                                    hash: tx.hash,
                                                                    block: block.height,
                                                                    amount: tx.amount,
                                                                    fee: tx.fee,
                                                                    from: tx.from,
                                                                    to: tx.to,
                                                                    timestamp: tx.timestamp,
                                                                    inputs: {},
                                                                    outputs: {}
                                                                }
                                                                await gun.get(`transactions/${key}/inputs`).once((txIPs) => {
                                                                    Object.keys(txIPs).map((index) => {
                                                                        if (index !== '_')
                                                                            gun.get(`transactions/${key}/inputs/${index}`).once((txIP) => {
                                                                                if (txIP.fee)
                                                                                    block.fee += txIP.fee
                                                                                tempTx.inputs[index] = txIP
                                                                            })
                                                                    })
                                                                })
                                                                await gun.get(`transactions/${key}/outputs`).once((txOPs) => {
                                                                    Object.keys(txOPs).map((index) => {
                                                                        if (index !== '_')
                                                                            gun.get(`transactions/${key}/outputs/${index}`).once((txOP) => {
                                                                                tempTx.outputs[index] = txOP
                                                                            })
                                                                    })
                                                                })
                                                                block.txs.push(tempTx)
                                                            })
                                                        }
                                                    })
                                                }
                                            })
                                            setPendingBlocks(pendingBlocks => ({ ...pendingBlocks, [key]: block }))
                                        }
                                    })
                                }
                            })
                        })
                    }
                })
            }
        })

    }, [validationTracker])

    useEffect(() => {
        if (pendingBlocks) {
            setLoading(false)
            setValidateLoading({})
            Object.keys(pendingBlocks).map(key => (
                setValidateLoading(validateLoading => ({
                    ...validateLoading,
                    [key]: false
                }))
            ))
        }
    }, [pendingBlocks])

    useEffect(() => {
        if (acctType === true || acctType === false)
            updateDet()
        else
            if (acctType !== 'miner')
                navigate('/dashboard')
        async function updateDet() {
            setAcctType(await getAcctType(acctType))
        }
    }, [acctType])

    function validateBlock(key, action) {
        setValidateLoading(validateLoading => ({
            ...validateLoading,
            [key]: true
        }));
        gun.get(`pending-blocks/${key}/${action}`).put({
            [user.is.pub]: true
        }).then(() =>
            gun.get(`pending-blocks/${key}/${action}`).once((count) => {
                gun.get('miners').then(async (miners) => {
                    if ((((Object.keys(count).length - 1) / (Object.keys(miners).length - 1)) * 100) > 50) {
                        if (action === 'accepted') {
                            let txOP = {
                                0: {
                                    address: pendingBlocks[key].coinBaseTx.to,
                                    amount: pendingBlocks[key].coinBaseTx.reward + pendingBlocks[key].fee,
                                }
                            }
                            let txIP = {
                                0: {
                                    address: 'CoinBase Reward',
                                    amount: pendingBlocks[key].coinBaseTx.reward + pendingBlocks[key].fee,
                                    fee: 0,
                                    hash: pendingBlocks[key].coinBaseTx.hash,
                                }
                            }
                            const blockTx = pendingBlocks[key].txs;
                            blockTx.unshift(
                                {
                                    hash: pendingBlocks[key].coinBaseTx.hash,
                                    amount: pendingBlocks[key].coinBaseTx.reward + pendingBlocks[key].fee,
                                    fee: 0,
                                    block: pendingBlocks[key].height,
                                    from: 'CoinBase Reward',
                                    to: pendingBlocks[key].coinBaseTx.to,
                                    timestamp: pendingBlocks[key].coinBaseTx.timestamp,
                                    inputs: txIP,
                                    outputs: txOP
                                })
                            const blockToAdd = {
                                hash: pendingBlocks[key].hash,
                                height: pendingBlocks[key].height,
                                nonce: pendingBlocks[key].nonce,
                                timestamp: pendingBlocks[key].timestamp,
                                miner: pendingBlocks[key].miner,
                                difficulty: pendingBlocks[key].difficulty,
                                merkleRoot: pendingBlocks[key].merkleRoot,
                                txCount: blockTx.length,
                                blockReward: pendingBlocks[key].coinBaseTx.reward + pendingBlocks[key].fee,
                                feeReward: pendingBlocks[key].fee,
                            }
                            await confirmTx(blockTx, pendingBlocks[key].height)
                            await addToBC(blockToAdd, blockTx);
                            await putAllUTXO(blockTx);
                            // await deleteUTXO(Object.assign({}, txIP))
                        }
                        gun.get('pending-blocks').put({ [key]: null }).then(() => {
                            setValidationTracker(!validationTracker)
                        })
                    } else
                        setValidationTracker(!validationTracker)
                })
            })
        )
    }
    return (
        loading ?
            <center><div className='loader'></div>
                <div style={{ fontStyle: 'italic', fontSize: 18 }}>Getting pending blocks...</div></center>
            :
            <div style={{ width: '1800px', maxWidth: '90%' }}>
                <ToastContainer />
                <h4 style={{ textAlign: 'left' }}>Pending Blocks</h4>

                {Object.keys(pendingBlocks).length > 0 ?
                    Object.values(pendingBlocks).map((block, index) => (
                        <table key={index} style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                            <tr><td>Block</td> <td>#{block.height}</td></tr>
                            <tr><td>Hash</td> <td>{block.hash}</td></tr>
                            <tr><td>Previous Hash</td>
                                <td>{block.height > 0 ?
                                    <Link to={`/block/${block.height - 1}`}>{block.prevHash}</Link>
                                    :
                                    block.prevHash
                                }</td>
                            </tr>
                            <tr><td>Timestamp</td> <td>{block.timestamp}</td></tr>
                            <tr><td>Transactions</td> <td>
                                {block.txsTemp.length > 0 ? block.txsTemp.map((tx, ind) => (
                                    <div key={ind}>
                                        <Link to={`/tx/${tx}`}>{tx ? `${tx.substring(0, 20)}...` : tx}</Link>
                                    </div>
                                ))
                                    :
                                    0}
                            </td></tr>
                            <tr><td>Nonce</td> <td>{block.nonce}</td></tr>
                            <tr><td>Difficulty</td> <td>{block.difficulty}</td></tr>
                            <tr><td>Miner</td> <td><Link to={`/address/${block.coinBaseTx.to}`}>{block.miner}</Link></td></tr>

                            {validateLoading[block.key] ?
                                <div className="loader"></div>
                                :
                                <tr>
                                    <td><button style={{ background: '#00cb00' }}
                                        onClick={() => validateBlock(block.key, 'accepted')}>Valid</button></td>
                                    <td><button style={{ background: 'red' }}
                                        onClick={() => validateBlock(block.key, 'rejected')}>Invalid</button></td>
                                </tr>
                            }
                        </table>
                    ))
                    :
                    'No pending block'
                }
            </div>
    )
}