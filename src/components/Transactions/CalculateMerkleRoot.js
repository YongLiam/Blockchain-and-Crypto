import sha256 from "crypto-js/sha256";

export default function calculateMerkleRoot(tx) {
    if (tx.length === 1)
        return tx[0]
    if (tx.length % 2 !== 0)
        tx.push(tx[tx.length - 1])
    let txTemp = [];
    let i = 0;
    while (i < tx.length - 1) {
        txTemp.push(sha256(tx[i] + tx[i + 1]).toString());
        i += 2;
    }
    const merkleRoot = calculateMerkleRoot(txTemp)
    return merkleRoot
}