import React, { useEffect, useState, useRef } from 'react'
import DateTimePicker from 'react-datetime-picker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css'; 
import axios from 'axios';
import './History.scss'
import { MapContainer, TileLayer,Marker, Popup,useMapEvent,useMap   } from "react-leaflet";
import L from 'leaflet'
import Form from 'react-bootstrap/Form';

import Calendar from 'react-calendar';
import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
import Clock from 'react-clock';

function History() {  
     const url = 'http://sawacpapi.runasp.net'
     const positionWarning = new L.Icon({ // vị trí GPS khi bị trộm đi qua
        iconUrl: require("./asset/images/positionWarning.png" ),
        iconSize: [60,60],
        iconAnchor: [28, 50],// nhỏ thì sang phải, xuống  
        popupAnchor: [3, -40], 
      })   
    const [valueFrom, onChangeFrom] = useState(new Date());
    const [valueTo, onChangeTo] = useState(new Date());
    
    const [selectedOption, setSelectedOption] = useState('');
    const [selectedLogger, setSelecteLogger] = useState({});
    
    const [listLoggerStolenHistory, setListLoggerStolenHistory] = useState([]);
    const [listPositionWantToDisplay, setListPositionWantToDisplay] = useState([]);
    const [listPositionWantToDelete, setListPositionWantToDelete] = useState([]);
    
    const [ZOOM_LEVEL, setZOOM_LEVEL] = useState(13) // độ zoom map
    const [center, setCenter] = useState({lat: 10.780064402624358,lng: 106.64558796192786 }) // center
    const mapRef = useRef() 

    const [displayRoutes, setDisplayRoutes] = useState(false)

    const getLogger = async () => {   // Lấy tất cả Logger về
        try {
         const response = await axios.get(`${url}/Logger/GetAllLoggers`);
         const LoggerData = response.data;
         const ListHistoryStolen = LoggerData.filter((item,index) => item.stolenLines.length > 0 )
         setListLoggerStolenHistory(ListHistoryStolen)
        } catch (error) {
          alert('Get All Logger ERROR:');
        }
    };

    useEffect(() => { 
        getLogger()
    }, [])

    useEffect(() => { // Cập nhật bản đồ với giá trị mới của center và ZOOM_LEVEL
        if (mapRef.current) {
              mapRef.current.setView(center, ZOOM_LEVEL);
        }
      }, [center]);

    const currentRoutingRef = useRef(null);
    

    const handleDisplayRoute = (list) => {  // hiển thị đường đi của GPS Tracker
          const lineStolen = list.map((item) => L.latLng(item.latitude, item.longtitude));
  
          currentRoutingRef.current = L.Routing.control({
          waypoints: [
          // L.latLng(ListPositionSafety[0].lat, ListPositionSafety[0].lng),        
              ...lineStolen
          ],
          lineOptions: {
            styles: [
              {
                color: "blue",
                opacity: 1,
                weight: 8
              }
            ]
          },  
          routeWhileDragging: true,   
          addWaypoints: false, 
          draggableWaypoints: false,
          fitSelectedRoutes: false,
          showAlternatives: false,
          show: false,
          createMarker: function() { return null; }        
          });
          currentRoutingRef.current.addTo(mapRef.current);
    }

    const RemoveRoute = () => {   // remove đường đi GPS Tracker
      if (currentRoutingRef.current) {
          currentRoutingRef.current.remove();
          currentRoutingRef.current = null;
      }
    };

    // useEffect(() => {
    //     if(listPositionWantToDisplay.length > 0){
    //         RemoveRoute()
    //         handleDisplayRoute(listPositionWantToDisplay)
    //     }   
    // },[listPositionWantToDisplay])

    const calculateDistance = (point1, point2) => {
      const latLng1 = L.latLng(point1.latitude, point1.longtitude);
      const latLng2 = L.latLng(point2.latitude, point2.longtitude);
      const distance = latLng1.distanceTo(latLng2);
      
      return distance;
    };

    const handleChange = (event) => {
        
        const HistoryStolen = listLoggerStolenHistory.find((item,index) => item.id === event.target.value )
        setSelecteLogger(HistoryStolen)
        setSelectedOption(event.target.value);
    };

    const handleShowRoute = () => { 
        if(selectedOption === ''){
                    window.alert('Bạn chưa chọn trạm cần xem')
        }
        else{
            
            // const startOfDay = new Date(valueFrom.setHours(0, 0, 0, 0));
            // const endOfDay = new Date(valueTo.setHours(23, 59, 59, 999));

            const startOfDay = new Date(valueFrom);
            const endOfDay = new Date(valueTo);

           
   
            const filteredLines = selectedLogger.stolenLines.filter(line => {
                  const timestamp = new Date(line.timestamp);
                  return timestamp >= startOfDay && timestamp <= endOfDay;
            });

            if(filteredLines.length === 0){
                window.alert('Không có dữ liệu')

            }  
            else{
                setListPositionWantToDisplay(filteredLines);
                setDisplayRoutes(true); 
                setCenter({lat:filteredLines[0].latitude , lng: filteredLines[0].longtitude })
                setZOOM_LEVEL(18)
            }
            
        }



    }

    const handleDeleteRoutes = async () => {
    if (selectedOption === '') {
        window.alert('Bạn chưa chọn trạm cần xóa');
    } else {
        // Hiển thị cửa sổ xác nhận
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa các dữ liệu này không?');

        if (confirmDelete) {

            const startOfDay = new Date(valueFrom);
            const endOfDay = new Date(valueTo);
      
            const filteredLines = selectedLogger.stolenLines.filter(line => {
                  const timestamp = new Date(line.timestamp);
                  return timestamp >= startOfDay && timestamp <= endOfDay;
            }); 

            if(filteredLines.length > 0){

              const startDate = formatDateTime(valueFrom);
              const endDate = formatDateTime(valueTo);
              const loggerId = selectedLogger.id;   

             
              
              try {
                  // Gọi API để xóa các phần tử trong stolenLine theo ngày
                  const response = await axios.delete(`${url}/StolenLine/DeleteStolenLineByDate/LoggerId=${loggerId}?startDate=${startDate}&endDate=${endDate}`);
                  
                  if (response.status === 200) {
                      // Cập nhật lại giao diện sau khi xóa thành công
                      window.alert('Xóa thành công!');
                      RemoveRoute();
                      setDisplayRoutes(false);
                      setListPositionWantToDisplay([]);
                      getLogger(); // Cập nhật lại danh sách Logger
                  } else {
                      window.alert('Có lỗi xảy ra khi xóa!');
                  }
              } catch (error) {
                  console.error('Lỗi khi gọi API xóa:', error);
                  window.alert('Có lỗi xảy ra khi xóa!');
              }

            }
            else{
              window.alert('Không có dữ liệu để xóa');
            }
           
            
            // Chuẩn bị tham số cho API
            
        } else {
            // Nếu người dùng chọn "Cancel", hủy thao tác xóa
           
        }
    }
    }

    function convertDateTime(inputString) {
      const [date, time] = inputString.split('T');
      const [year, month, day] = date.split('-');
      return `${day}-${month}-${year} ${time}`;
    }

  const formatDateTime = (date) => {
    if (!date) return "No date selected";
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
 
  return (   
    <div className='History'>                        
      <div className='filter'>        
                <div className='filterItem filterItemSelectLogger'>                      
                        <select 
                          className="form-select" 
                          aria-label="Default select example" 
                          value={selectedOption}
                          onChange={handleChange}
                        >
                          <option value="">--Chọn--</option>
                          {listLoggerStolenHistory.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>

                </div> 
                <div className='filterItem'>
                        <div>
                            Thời điểm bắt đầu
                        </div>
                        <div>
                       
                        
                        <DatePicker
                              selected={valueFrom}
                              onChange={onChangeFrom}
                              showTimeSelect
                              timeIntervals={1}
                              timeFormat="HH:mm:ss"
                              dateFormat="dd/MM/yyyy - HH:mm:ss"
                          />

                        </div>
                </div> 
                <div className='filterItem'>
                        <div>
                          Thời điểm kết thúc
                        </div>
                        <div>  

                        <DatePicker
                              selected={valueTo}
                              onChange={onChangeTo}
                              showTimeSelect
                              timeIntervals={1}
                              timeFormat="HH:mm:ss"
                              dateFormat="dd/MM/yyyy - HH:mm:ss"
                          />
                             
                            
                        </div>
                </div>
                <div className='filterItem filterItemButton'>
                        <button 
                            type="button" 
                            class="btn btn-info"
                            onClick={handleShowRoute}

                        >Xem</button>
                        <button 
                            type="button" 
                            class="btn btn-danger"
                            onClick={handleDeleteRoutes}
                        >Xóa</button>
                </div>
              </div>
              

              <div className='mapStolenLine'>
              
              <MapContainer 
                          center={center} 
                          zoom={ZOOM_LEVEL}     
                          ref={mapRef}>
                        <TileLayer
                             attribution ='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            
                        />
                                
                                                         
                                {displayRoutes &&  listPositionWantToDisplay.map((item,index)=>(
                                  <Marker 
                                      className='maker'
                                      position={[item.latitude , item.longtitude]}
                                      icon= { positionWarning } 
                                      key={index}                               
                                  >
                                    <Popup>
                                        <div className='div-popup'>
                                            <div>{convertDateTime(item.timestamp)}</div>                                                                    
                                        </div>                                                                             
                                    </Popup>    
                                </Marker>
                                ))}                                                                                                                                           
                    </MapContainer>
        </div>
             
    </div>
  )
}

export default History
