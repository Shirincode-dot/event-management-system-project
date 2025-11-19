import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import AdminView from './AdminView.jsx';
import AdminLogin from "./AdminLogin.jsx";
import '../index.css';
import './App.css';

export default function App(){
  return (
    <BrowserRouter>
      <div>
        <nav style={{padding:10, background:'transparent', borderBottom:'1px solid rgba(112,94,70,0.03)'}}>
          <div style={{maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <Link to="/admin" style={{textDecoration:'none'}}>
              <div style={{display:'flex', gap:10, alignItems:'center'}}>
                <div style={{width:36,height:36,borderRadius:8, background:'linear-gradient(90deg,var(--gold),var(--earth))', display:'flex',alignItems:'center',justifyContent:'center', color:'white', fontWeight:700}}>EE</div>
                <div style={{fontWeight:700, color:'var(--earth)'}}>Euphoria Events</div>
              </div>
            </Link>
            <div style={{display:'flex', gap:12}}>
              <a href="http://localhost:5173" style={{textDecoration:'none', color:'var(--earth)', fontWeight:600}}>Back to Website</a>
              <Link to="/admin" style={{textDecoration:'none', color:'var(--earth)', fontWeight:600}}>Admin</Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
