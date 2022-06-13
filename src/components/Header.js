import { Link, useLocation } from "react-router-dom"
import { VscListFlat } from 'react-icons/vsc'
import { useState } from "react";

export default function Header() {
    const [headerClass, setHeaderClass] = useState("default");
    const { pathname } = useLocation()
    let path = pathname.split('/')

    function handleHeader() {
        if (headerClass === "default") {
            setHeaderClass("responsive");
        } else {
            setHeaderClass("default");
        }
    }
    return (
        <my-header>
            <div className={headerClass}>
                <Link to='/dashboard' className={path.includes('dashboard') ? 'nav-active' : ''}>Dashboard</Link>
                <Link to='/send' className={path.includes('send') ? 'nav-active' : ''}>Send</Link>
                <Link to='/blocks' className={path.includes('blocks') || path.includes('block') ? 'nav-active' : ''}>Blocks</Link>
                <Link to='/txs' className={path.includes('txs') || path.includes('tx') ? 'nav-active' : ''}>Transactions</Link>
                <Link to='/unconfirmed-tx' className={path.includes('unconfirmed-tx') ? 'nav-active' : ''}>Mempool</Link>
                <Link to='/miner' className={path.includes('miner') ? 'nav-active' : ''}>MINERS</Link>
                <Link to='#' className="icon" onClick={() => handleHeader()} >
                    <VscListFlat />
                </Link>
            </div>
        </my-header>
    )
}