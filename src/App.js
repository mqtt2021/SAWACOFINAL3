import './App.scss';
import Header from './Header';
import React, { useEffect, useState, createContext } from 'react'
import { ToastContainer } from 'react-toastify';
import AppRoutes from './AppRoutes';
import { MapProvider } from './MapContext';
function App() {
  
  return (
    <MapProvider>
      <div className='Container'>
            <div className="App-container">
                   <Header />    
                   <AppRoutes />
           </div>
           <ToastContainer
                 position="top-right"
                 autoClose={5000}
                 hideProgressBar={false}
                 newestOnTop={false}
                 closeOnClick
                 rtl={false}
                 pauseOnFocusLoss
                 draggable
                 pauseOnHover
                 theme="light"
           />
         </div> 
    </MapProvider>
        
    
 
  
  );
}

export default App;
