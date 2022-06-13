import './App.css';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function App({ user }) {

  const navigate = useNavigate();

  useEffect(() => {
    if (user.is)
      navigate("/dashboard");
  }, [])

  return (
    <>
      Welcome to Blockchain and Cryptocurrency Demo
      <p style={{ background: '#94d0cf21', padding: 50, }}>
        To continue, kindly
        <div style={{ display: 'flex', marginTop: 10, }}>
          <button onClick={() => navigate("login")}>Login</button>
          <span style={{ margin: '0px 20px' }}>or</span>
          <button onClick={() => navigate("/join")}>Sign up</button>
        </div>
      </p>
    </>
  );
}
