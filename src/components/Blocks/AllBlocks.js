import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCubes } from 'react-icons/fa'
import './Table.css'
import { colors } from '../Others/Colors';
import { getTDate } from '../Others/GetDate';

export default function AllBlocks({ gun }) {
    const [loading, setLoading] = useState(true)
    const [blocks, setBlocks] = useState(new Set())

    useEffect(() => {
        async function getBlocks() {
            gun.get('blockchain').once((bcBlocks) => {
                if (bcBlocks)
                    Object.keys(bcBlocks).map((key) => {
                        if (key !== '_')
                            gun.get(`blockchain/${key}`).once((block) => {
                                setBlocks(prevState => new Set(prevState).add(block))
                            })
                        return null;
                    })
            })
        }
        gun.get('blockchain').on(() => getBlocks())
    }, [gun])

    useEffect(() => {
        if (blocks)
            setLoading(false)
    }, [blocks])

    return (
        loading ?
            <center><div className='loader'></div>
                <div style={{ fontStyle: 'italic', fontSize: 18 }}>Getting blocks...</div></center>
            :
            blocks.size > 0 ?
                <div className='blocks-table'>
                    <h4 style={{ textAlign: 'left', marginLeft: '5%' }}><FaCubes color={colors.link} /> Blocks</h4>
                    <table style={{ margin: 'auto', width: '90%' }}>
                        <thead>
                            <tr style={{ display: 'contents' }}>
                                <th scope="col">Height</th>
                                <th scope="col">Hash</th>
                                <th scope="col">Timestamp</th>
                                <th scope="col">Miner</th>
                                <th scope="col">TXs</th>
                            </tr>
                        </thead>

                        <tbody>
                            {[...blocks].sort((a, b) => a.timestamp > b.timestamp ? -1 : 1).map((block, index) => (
                                <tr key={index}>
                                    <td data-label="Height"><Link to={`/block/${block.height}`}>#{block.height}</Link></td>
                                    <td data-label="Hash"><Link to={`/block/${block.height}`}>{block.hash}</Link></td>
                                    <td data-label="Timestamp">{getTDate(new Date(block.timestamp))}</td>
                                    <td data-label="Miner">{block.miner}</td>
                                    <td data-label="TXs">{block.txCount}</td>
                                </tr>
                            ))
                            }
                        </tbody>
                    </table>
                </div>
                :
                'No block in blockchain'
    )
}