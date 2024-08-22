import { Route,Routes } from 'react-router-dom';
import React,{useContext} from 'react'
import Map from './Map';
import History from './History';
import './routes.scss'  

function AppRoutes() {

  return (
    <div className='routes'>
            <Routes>
               
                {/* <Route path="/map" element={ <Map/>} />
                
                <Route path="/setting" element={ <Setting/>} />
                
                <Route path="/report/collection" element={ <Collection/>} />
                <Route path="/report/warning" element={ <Warning/>} />
                <Route path="/report/statistic" element={ <Thongke/>} />
                  
                <Route path="/register" element={ <Register/>} />
  
                <Route path="/bin/:id/data" element={<Chart/>} />
                
                <Route path="/bin/:id/detail" element={<Detail/>} />

                <Route path="/addnewbin" element={<AddNewBin/>} />

                <Route path="/bin/:id/detail/update" element={<Updatebin/>} /> */}
                <Route path="/" element={ <Map/>} />
                <Route path="/History" element={ <History/>} />
            </Routes>          
    </div>
  )
}

export default AppRoutes
