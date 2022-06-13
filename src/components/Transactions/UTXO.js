import Gun from 'gun'
import { PEERS } from '../Others/Peers';
require('gun/sea')

const gun = Gun({
    peers: PEERS
})

async function getAddressUTXO(address) {
    const rUTXO = await gun.get('UTXO').then((utxo) => {
        if (utxo) {
            let addressUtxo = {};
            Object.keys(utxo).map((key) => {
                if (key !== '_') {
                    // bug, so get all utxo
                    gun.get('UTXO').get(key).then((utxo) => {
                    })
                    gun.get('UTXO').get(key).get(address).once((tx) => {
                        if (tx > 0)
                            addressUtxo[key] = tx;
                    })
                }
            })
            return [addressUtxo, Object.values(addressUtxo).reduce((sum, a) => sum + a, 0)]
        }
        else
            return [{
            }, 0]
    })
    return rUTXO
}

async function putUTXO(hash, outputs) {
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

async function putAllUTXO(txs) {
    for (let i = 0; i < txs.length; i++) {
        let utxo = {
        }
        Object.values(txs[i].outputs).map((op) => {
            if (txs[i].from !== op.address)
                utxo[op.address] = op.amount
        })
        gun.get('UTXO').get(txs[i].hash).put(utxo)
    }
}

async function deleteUTXO(inputs) {
    Object.keys(inputs).map((key) => {
        gun.get(`UTXO/${inputs[key].hash}`).get(inputs[key].address).put(null)
    })
}

export { getAddressUTXO, putUTXO, putAllUTXO, deleteUTXO }