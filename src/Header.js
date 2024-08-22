
import React, { useEffect, useState, useContext } from 'react'
import './Header.scss'
import {Link} from "react-router-dom";
import axios from 'axios';
import { IoMenu } from "react-icons/io5";
import { CiMap } from "react-icons/ci";
import { RxDashboard } from "react-icons/rx";
import { FaDatabase } from "react-icons/fa";    
import { IoIosWarning } from "react-icons/io";
import { SlArrowDown } from "react-icons/sl";
import { SlArrowUp } from "react-icons/sl";
import { FaBatteryHalf } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";

import { useMapContext } from './MapContext';

function Header() {

  const { setCenter, setZoomLevel, setPercentBattery, setGetPositionUser } = useMapContext();

  const url = 'http://sawacpapi.runasp.net'
  const ListBatteryPercent = [60,40,30,20,10]  // các mức pin cần thay

  const [listLoggerStolen,setlistLoggerStolen] = useState([]) // danh sách Logger bị trộm ở hiện tại
  const [listLoggerStolenHistory,setListLoggerStolenHistory] = useState([]) // danh sách Logger từng bị trộm 

  const [displayNavigation,setdisplayNavigation] = useState(false) // hiển thị thanh Nav khi ở kích thước điện thoại
  const [showTableWarning, setshowTableWarning] = useState(false) // hiển thị những địa điểm bị trộm
  // const [center, setCenter] = useState({ lat: 10.770834441565942, lng : 106.6731350560201 }) // center
  const [ZOOM_LEVEL,setZOOM_LEVEL] = useState(13) // độ zoom map
  const [showPercentBattery, setshowPercentBattery] = useState(false);  // hiển thị bảng thay pin
  const [selectPercentBattery, setselectPercentBattery] = useState(null); // chọn mức pin cần thay
  const getLogger = async () => {   // Lấy tất cả Logger về
      try {
       const response = await axios.get(`${url}/Logger/GetAllLoggers`);
       const LoggerData = response.data;
       
       const ListStolenCurrent = LoggerData.filter((item,index) => item.stolen === true )
       
       setlistLoggerStolen(ListStolenCurrent)

       const ListHistoryStolen = LoggerData.filter((item,index) => item.stolenLines.length > 0 )
       setListLoggerStolenHistory(ListHistoryStolen)
       
           
      } catch (error) {
        alert('Get All Logger error:');
      }
    };

    useEffect(() => { 
      getLogger()
    }, [])

    const handleDisplayNavigation = () =>{
      setdisplayNavigation(pre=>!pre)   
    }

    const handleShowTableWarning = () => {
      setshowTableWarning( pre => !pre )
    }

    const handleMovetoWarning = (dataLoggerStolen) => {  // di chuyển đến địa điểm có trộm
      console.log(dataLoggerStolen)
      // RemoveRoute()
      setCenter({ lat: dataLoggerStolen.latitude, lng : dataLoggerStolen.longtitude })
      // setdataLogerisChoose(dataLoggerStolen)
      // const newArray = dataLoggerStolen.stolenLines.filter((item, index) => index !==  dataLoggerStolen.stolenLines.length - 1);
      // setListMakerStolenLine(newArray)
      // setdisplayNavigation(false)
      // setisDisplayRouteGPS(true)
      // setCenter({lat:datalogger.lat , lng: datalogger.lng})
      setZoomLevel(18)      
      // handleDisplayRoute(dataLoggerStolen)  
    }

    const handleShowPercentBattery = () => {   // hiển thị bảng chọn mức pin
          setshowPercentBattery(pre=>!pre)
    } 

    const handleSelectPercentBattery = (percent) => {  // Khi chọn mức pin cần thay trong bảng chọn thì set vị trí người thay pin và set mức pin cần thay
      setdisplayNavigation(false)   
      // setselectPercentBattery(percent)  
      setPercentBattery(percent)   
      setGetPositionUser(true) 
      // setpositionUser({latitude: locationUser.coordinates.latitude, longtitude: locationUser.coordinates.longtitude})
    }

    
    

  return (
    <div className='header font-barlow'>  
                          <div className='Menu' onClick={handleDisplayNavigation}>
                                <div><IoMenu/></div>                              
                                {listLoggerStolen.length > 0  && <div className='amountOfWarning'>{listLoggerStolen.length}</div>}
                                        
                          </div>                          
                          <div className='divNavigation'>
                               <Link to="/">
                                  <div className='NavigationItem NavigationItemWarning '
                                        onClick={handleShowTableWarning}
                                  >                                      
                                      <div className='NavigationItemIcon'>
                                          <div><IoIosWarning/></div>
                                          <div className='NavigationItemIconText'>Bản đồ</div>
                                          {listLoggerStolen.length > 0   && <div className='amountOfWarning'>{listLoggerStolen.length}</div>}
                                      </div>
                                      <div className='NavigationItemShow divAmountOfWarning'>
                                        {showTableWarning ? <div><SlArrowUp/></div>:<div><SlArrowDown/></div>}
                                      </div>    
                                  </div> 
   
                               </Link>
                                   

                                  {showTableWarning && <div className='WrapPositionWarning'>

                                    {listLoggerStolen.map((item , index) => (
                                          <div  className='positionWarning'
                                                onClick={() => handleMovetoWarning(item)}
                                                key={index}
                                                >{item.name}                 
                                          </div>))}
                                  
                                  </div>}    
                                 <Link to="/">
                                  <div className='NavigationItem NavigationItemBattery'
                                        onClick={handleShowPercentBattery}
                                  >
                                      <div className='NavigationItemIcon'>
                                          <div><FaBatteryHalf/></div>
                                          <div>Thay Pin</div>
                                      </div>
                                      <div className='NavigationItemShow divAmountOfWarning'>
                                            
                                      {showPercentBattery ? <div><SlArrowUp/></div>:<div><SlArrowDown/></div>}   
                                      </div>                                                                 
                                  </div>
                                 </Link>
                                  
                                  
                                  {showPercentBattery && <div className='divBatteryPercent'>
                                  
                                  {
                                    ListBatteryPercent.map((item,index)=>(
                                      <div className='batteryPercent'
                                        onClick={() => handleSelectPercentBattery(item)}
                                      >                              
                                        <div>{` < ${item}%`}</div>                               
                                      </div>
                                    ))
                                  }   
                                  </div>}   

                                  <Link  to="/History"> 
                                      <div className='NavigationItem NavigationItemBattery'
                                            
                                      >
                                          <div className='NavigationItemIcon'>
                                              <div><FaHistory/></div>
                                              <div>Lịch sử</div>
                                          </div>    

                                      </div> 
                                  </Link>

                                    



                          </div>

                          { displayNavigation &&
                            <div className='divNavigationMobile'>    
                                  <div className='NavigationItem NavigationItemWarning '
                                        onClick={handleShowTableWarning}
                                  >
                                      <div className='NavigationItemIcon'>
                                          <div><IoIosWarning/></div>
                                          <div className='NavigationItemIconText'>Cảnh báo</div>
                                          {listLoggerStolen.length > 0   && <div className='amountOfWarning'>{listLoggerStolen.length}</div>}
                                      </div>
                                      <div className='NavigationItemShow divAmountOfWarning'>                                       
                                        {showTableWarning ? <div><SlArrowUp/></div>:<div><SlArrowDown/></div>}
                                      </div>
                                  </div>

                                  {showTableWarning && listLoggerStolen.map((item , index) => (
                                    <div  className='positionWarning'
                                          key={index}
                                          onClick={() => handleMovetoWarning(item)}
                                  >{item.name}</div>
                                  ))}
                                  
                                  <div className='NavigationItem NavigationItemBattery'
                                        onClick={handleShowPercentBattery}
                                  >
                                      <div className='NavigationItemIcon'>
                                          <div><FaBatteryHalf/></div>
                                          <div>Thay Pin</div>
                                      </div>
                                      <div className='NavigationItemShow divAmountOfWarning'>
                                        
                                      {showPercentBattery ? <div><SlArrowUp/></div>:<div><SlArrowDown/></div>}   
                                      </div>                                                                  
                                  </div>
                                  
                                  {showPercentBattery && <div className='divBatteryPercent'>
                                  
                                  {
                                    ListBatteryPercent.map((item,index)=>(
                                      <div  className='batteryPercent'
                                            key={index}
                                            onClick={() => handleSelectPercentBattery(item)}
                                      >                              
                                            <div>{`${item}%`}</div>                               
                                      </div>
                                    ))
                                  }
                                  </div>}
                          </div>
                          }
                          {/* <div className='currentTime'>{currentTime.toLocaleTimeString()}</div> */}
                         

                  </div>
  )
}

export default Header
