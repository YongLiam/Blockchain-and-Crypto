import Gun from 'gun'
import { getLastBlock } from '../Blocks/GetLastBlock';
import { getTDate } from '../Others/GetDate';
import { PEERS } from '../Others/Peers';
require('gun/sea')

const gun = Gun({
    peers: PEERS
})

export async function getUserTx(address) {
    const txs = await gun.get('transactions');
    if (txs) {
        let myTXs = {};
        let myTXsStats = { received: 0, sent: 0 }
        const allTxs = Object.keys(txs);
        for (let i = 0; i < allTxs.length + 1; i++) {
            if (i === allTxs.length)
                return [myTXs, myTXsStats];
            if (allTxs[i] !== '_') {
                const tx = await gun.get(`transactions/${allTxs[i]}`);
                const txOP = await gun.get(`transactions/${allTxs[i]}/outputs/0`)
                const txIP = await gun.get(`transactions/${allTxs[i]}/inputs/0`)
                if (txOP.address === address) {
                    if (!myTXs[allTxs[i]])
                        myTXs[allTxs[i]] = { hash: allTxs[i] }
                    myTXs[allTxs[i]].from = txIP.address;
                    myTXs[allTxs[i]].amount = txIP.amount;
                    if (!isNaN(tx.block))
                        myTXsStats.received += txIP.amount;
                }
                if (txIP.address === address) {
                    if (!myTXs[allTxs[i]])
                        myTXs[allTxs[i]] = { hash: allTxs[i] }
                    myTXs[allTxs[i]].to = txOP.address;
                    myTXs[allTxs[i]].amount = txOP.amount;
                    if (!isNaN(tx.block))
                        myTXsStats.sent += txOP.amount + txIP.fee;
                    myTXs[allTxs[i]].fee = txIP.fee;
                }
                if (myTXs[allTxs[i]]) {
                    myTXs[allTxs[i]].block = tx.block
                    myTXs[allTxs[i]].timestamp = getTDate(new Date(tx.timestamp))
                    myTXs[allTxs[i]].confirmations = isNaN(tx.block) ? 0 : (await getLastBlock() - tx.block) + 1
                }

            }
        }
    } else
        return [{}, { received: 0, sent: 0 }];
}