import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import HomePage from './components/HomePage';
import MeetingRoom from './components/MeetingRoom';
import JoinRoom from './components/JoinRoom';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

function App() {
  return (
    <AppContainer>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<MeetingRoom />} />
        </Routes>
      </Router>
    </AppContainer>
  );
}

export default App;