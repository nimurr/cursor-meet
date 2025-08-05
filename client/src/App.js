import React from 'react';

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: 40 }}>
      <h1>MERN Meet</h1>
      <p>Welcome to your video meeting app!</p>
      <div style={{ margin: '30px 0' }}>
        <button style={{ margin: 10, padding: '10px 20px' }}>Login</button>
        <button style={{ margin: 10, padding: '10px 20px' }}>Sign Up</button>
      </div>
      <div>
        <input placeholder="Enter meeting code or create new" style={{ padding: '10px', width: 250 }} />
        <button style={{ marginLeft: 10, padding: '10px 20px' }}>Join/Create</button>
      </div>
    </div>
  );
}

export default App;
