import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';

/* removes print statements in production */
import "../print.config.ts";

function App() {
  return (
    <>
      <Routes>
          <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;
