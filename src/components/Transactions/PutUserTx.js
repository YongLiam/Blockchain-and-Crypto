import Gun from 'gun'
import { PEERS } from '../Others/Peers';
require('gun/sea')

const gun = Gun({
    peers: PEERS
})

async function putToMempool(hash, outputs) {
    let utxo = {
        hash: hash
    }
    Object.keys(outputs).map((key) => {
        utxo[outputs[key].address] = outputs[key].amount;
    })
    const rUTXO = gun.get('UTXO').put({
        [hash]: utxo
    }).then(() => { return true })
    return rUTXO
}


async function confirmTx(transactions, block) {
    transactions.map((tx) => {
        if (tx.from === 'CoinBase Reward')
            gun.get('transactions').get(tx.hash).put(tx)
        else
            gun.get('transactions').get(tx.hash).get('block').put(block)
    })
}


export { confirmTx, putToMempool }