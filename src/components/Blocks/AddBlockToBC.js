import Gun from 'gun'
import { PEERS } from '../Others/Peers';
require('gun/sea')

const gun = Gun({
    peers: PEERS
})

export async function addToBC(block, blockTx) {
    gun.get('blockchain').put({
        [block.height]: block
    }).then(() => {
        gun.get('blockchain').get(block.height).put({
            transactions: blockTx.reduce((txs, tx) => ({ ...txs, [tx.hash]: tx }), {})
        })
    })
}