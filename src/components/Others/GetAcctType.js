import Gun from 'gun'
import { PEERS } from './Peers';
require('gun/sea')

const gun = Gun({
    peers: PEERS
})
var user = gun.user().recall({ sessionStorage: true });

export async function getAcctType(acctType) {
    const curUser = await user.get('info')
    if (curUser)
        return (curUser.acctType)
    else
        return (!acctType)
}