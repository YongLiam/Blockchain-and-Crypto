export default function Footer() {
    const members = [
        {
            name: 'Charitha',
            link: ''
        },
        {
            name: 'William',
            link: ''
        },
        {
            name: 'Dhriti',
            link: ''
        },
        {
            name: 'Sudeep',
            link: ''
        },
    ]

    return (
        <footer>
            <div className="footer-div">
                <div style={{ textDecoration: 'underline', fontWeight: 'bolder', marginBottom: 5 }}>Project By:</div>
                <div className="name">
                    {members.map((member, key) => (
                        <span
                            key={key}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                                window.open(member.link, '_blank')}>{member.name}{key < members.length - 1 ? ', ' : null}</span>
                    ))}
                </div>
            </div>
            <div className="footer-div">
                <div style={{ textDecoration: 'underline', flex: 2, fontWeight: 'bolder', marginBottom: 5 }}
                >Under the guidance of:</div>
                <div style={{ cursor: 'pointer' }}
                    onClick={() =>
                        window.open('https://jntuhceh.ac.in/faculty_details/5/dept/360', '_blank')}>
                    <div className="name">Dr. R. SRIDEVI</div>
                    <code>Professor in CSE & Coordinator, Centre of Excellence in Cyber security, JNTUH</code>
                </div>
            </div>
            <div>B.Tech CSE (R18)<br />
                IV Year, II Semester - 2022<br />
                <b>©{new Date().getUTCFullYear()}</b>
            </div>
        </footer>
    )
}