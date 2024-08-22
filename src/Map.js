import './App.scss';
import React, { useState,useEffect,useRef } from "react";
import { MapContainer, TileLayer,Marker, Popup,useMapEvent   } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet'
import "leaflet/dist/leaflet.css";
import * as signalR from "@microsoft/signalr";
import ChangeName from './ChangeName';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import './Map.scss'
import useGeoLocation from "./useGeoLocation"
import {  toast } from 'react-toastify';
import ModelConfirm from './ModelConfirm';
import { useMapContext } from './MapContext';
function Map() {
 
  const { center, zoomLevel, percentBattery, getPositionUser } = useMapContext();    
  const [mqttAuCo, setMqttAuCo] = useState (
    {
              id: null,
              latitude: null,
              longitude: null,
              battery: null,
              temperature: null,       
              timestamp: null   
    }
  ) 
  const [mqttAuCoMotionDetect, setMqttAuCoMotionDetect] = useState (
    {
              id: null,
              battery: null,
              timestamp: null
    }
  ) 
  const [LoggerGetByIdFromMqtt, setLoggerGetByIdFromMqtt] = useState({id:null})  
  const locationUser = useGeoLocation()  // lấy vị trí của người thay pin
  const [showModalChangeName, setshowModalChangeName] = useState(false); // hiển thị bảng đổi tên
  const [showModalConfirmDeleteGPS, setShowModalConfirmDeleteGPS] = useState(false); // hiển thị bảng đổi tên
  const [ZOOM_LEVEL,setZOOM_LEVEL] = useState(13) // độ zoom map
  const [listAllLogger, setListAllLogger]= useState([]) // danh sách tất cả logger
  const [dataLogerisChoose, setdataLogerisChoose] = useState({}) // dataLogger được chọn để theo dõi
  const mapRef = useRef()  
  const [showTableWarning, setshowTableWarning] = useState(false) // hiển thị những địa điểm bị trộm
  const [isWarning, setisWarning] = useState(false); // tín hiệu bị trộm
  const [isDisplayRouteGPS, setisDisplayRouteGPS] = useState(false); // hiển thị đường đi GPS Tracker
  const [positionUser, setpositionUser] = useState({ latitude: "", longtitude: "" }); //vị trí của người thay pin    
  const [isShowPositionUser, setIsShowPositionUser] = useState(false); // hiển thị vị trí người thay pin
  const [listLoggerBattery,setlistLoggerBattery] = useState([]) // danh sách Logger cần thay pin
  const [listLoggerStolen,setlistLoggerStolen] = useState([]) // danh sách Logger bị trộm
  const [listFinishStolen,setListFinishStolen] = useState([]) // danh sách Logger hết bị trộm nhưng chưa xóa dữ liệu GPS
  const [dataLoggerEdit,setdataLoggerEdit] = useState({}) // chọn dataLogger cần sửa tên
  
  //  const url = 'https://sawacocloud.azurewebsites.net'
    
  const url = 'http://sawacpapi.runasp.net'
  
  const wakeup = new L.Icon({ // marker bình thường
    iconUrl: require("./asset/images/position.png" ),
    iconSize: [40,52],  
    iconAnchor: [17, 49],     // nhỏ thì sang phải, xuống  
    popupAnchor: [3, -45],   // nhỏ thì sang trái  
  })
  // const FinishTolen = new L.Icon({ // marker bình thường
  //   iconUrl: require("./asset/images/NotStolen.png" ),
  //   iconSize: [60,62],  
  //   iconAnchor: [18, 60],// nhỏ thì sang phải, xuống  
  //   popupAnchor: [3, -45],   // nhỏ thì sang trái  
  // })

  const warning = new L.Icon({  // marker bị trộm
    iconUrl: require("./asset/images/warning.png" ),
    iconSize: [50,55],
    iconAnchor: [28, 50],    // nhỏ thì sang phải, xuống       
    popupAnchor: [4, -45], 
  })

  // const positionWarning = new L.Icon({ // vị trí GPS khi bị trộm đi qua
  //   iconUrl: require("./asset/images/positionWarning.png" ),
  //   iconSize: [60,60],
  //   iconAnchor: [28, 50],// nhỏ thì sang phải, xuống  
  //   popupAnchor: [3, -40], 
  // })

  const user = new L.Icon({  // vị trí người thay pin
    iconUrl: require("./asset/images/maker_user.png" ),
    iconSize: [60,60],
    iconAnchor: [25, 50],
    popupAnchor: [6, -40], 
  })

  const battery = new L.Icon({  // vị trí những DataLogger có mức pin cần thay
    iconUrl: require("./asset/images/battery.png" ),
    iconSize: [65,60],
    iconAnchor: [29, 54], // nhỏ thì sang phải, xuống
    popupAnchor: [3, -46], 
  })

  const showMyLocation = () => {  // di chuyển map tới vị trí người thay pin
    if (locationUser.loaded && !locationUser.error) {
      mapRef.current.flyTo(
        [locationUser.coordinates.latitude, locationUser.coordinates.longtitude],
        18,
        { animate: true }   
      );
    } else {
      alert('Không thể xác định vị trí của bạn');
    }
  };
  
    const getLogger = async () => {   // Lấy tất cả Logger về
      try {
       const response = await axios.get(`${url}/Logger/GetAllLoggers`);
       const LoggerData = response.data;
       setListAllLogger(LoggerData)
       const ListStolen = LoggerData.filter((item,index) => item.stolen === true )
       setlistLoggerStolen(ListStolen)
      } catch (error) {
        alert('Get All Logger error:');
      }
    };


// const client = mqtt.connect('wss://mqtt.eclipseprojects.io:443/mqtt');

useEffect(() => {  
      getLogger()
}, [])

useEffect(() => {
  if( percentBattery > 0 ) {
            const  listDataLoggerBattery = listAllLogger.filter((item,index)=> item.battery <= parseInt(percentBattery) )
            if(listDataLoggerBattery.length > 0  ){
              setlistLoggerBattery(listDataLoggerBattery)
              setIsShowPositionUser(true)
              showMyLocation()
            }
            else{
              window.alert('Không có mức pin cần thay')   
              setIsShowPositionUser(false)
              setlistLoggerBattery([])   
            }           
  }        
},[percentBattery])

// useEffect(() => {  // Khi chọn được mức pin cần thay thì lọc ra danh sách thay pin
//   if(selectPercentBattery > 0){
//         const  listDataLoggerBattery = listAllLogger.filter((item,index)=>item.battery <= parseInt(selectPercentBattery) )
//         setlistLoggerBattery(listDataLoggerBattery)
//   }  
// },[selectPercentBattery])

// let array = []
// client.on('message', (topic, message) => {
//   if (topic === 'SAWACO/STM32/Latitude') {
//     const jsonDatalat = JSON.parse(message.toString());
//     array.push(jsonDatalat)
//     console.log(jsonDatalat)
//   }    
//   if(topic === 'SAWACO/STM32/Longitude'){
//     const jsonDatalng = JSON.parse(message.toString());
//     array.push(jsonDatalng)
//     console.log(jsonDatalng)
//   }
//   if(array.length === 2){
//     if(parseFloat(array[0].value)>0){         
//             settimeStamp(array[0].timestamp)
//             setDatalogger({ ...datalogger, lat:  parseFloat(array[0].value),  lng:  parseFloat(array[1].value)})                      
//             console.log(array)
//             array = [] 
//     }                
//   }
// });

// useEffect(() => {
//   console.log('UseEffect Begin')
//   let storedData = localStorage.getItem('datalogger');
//   if (storedData) {
//     setDatalogger(JSON.parse(storedData));
//   }
// }, []);

// const getLoggerByIdFromMqtt = async (Id) => {
//   try {
//     const response = await axios.get(`${url}/Logger/GetLoggerById?Id=${Id}`);
//     setLoggerGetByIdFromMqtt(response.data)
    
//   } catch (error) {
//     console.error('Error deleting logger:', error);
//   }
// };

// const UpdateLoggerMqttPublish = async (mqttObjectUpdate) => {
//   try {   
//       const response = await axios.patch(`${url}/Logger/UpdateLoggerStatus/Id=${mqttObjectUpdate.id}`,
//         {       
//               longtitude: mqttObjectUpdate.longtitude,
//               latitude: mqttObjectUpdate.latitude,
//               name: mqttObjectUpdate.name,
//               battery: mqttObjectUpdate.battery, 
//               temperature: mqttObjectUpdate.temperature,  
//               stolen: mqttObjectUpdate.stolen,
//               bluetooth: mqttObjectUpdate.bluetooth,
//               timeStamp: mqttObjectUpdate.timestamp                         
//         }      
//       );
//       getLogger()
//   } catch (error) {
//     console.error('Error UpdateLoggerMqttPublish:', error);
//   }
// };

// const postStolenLine = async () => {   
//   try {
    
//     await axios.post(`${url}/StolenLine/AddStolenLine`, {
//       loggerId: mqttAuCo.id,     
//       longtitude: mqttAuCo.longitude,       
//       latitude: mqttAuCo.latitude,    
//       timestamp: mqttAuCo.timestamp 
//     }   
//     );
    
//   } catch (error) {
//     console.error('Error postStolenLine:', error);
//   }
// };

// const deleteStolenLineAuCo = async () => {
//   try {
//     await axios.delete(`${url}/StolenLine/DeleteStolenLineByLoggerId/LoggerId=c01b`);
    
//   } catch (error) {
//     console.error('Error deleting logger:', error);
//   }
// };

// let arrayMqttAuCo = []

useEffect( () => {
  let connection = new signalR.HubConnectionBuilder()   
      .withUrl("http://sawacpapi.runasp.net/NotificationHub")   
      .withAutomaticReconnect()    
      .build();     
  // Bắt đầu kết nối   
  connection.start()   
      .then(() => {
          console.log('Kết nối thành công!');
      })
      .catch(err => {
          console.error('Kết nối thất bại: ', err);
      });
  // Lắng nghe sự kiện kết nối lại
  connection.onreconnected(connectionId => {
      console.log(`Kết nối lại thành công. Connection ID: ${connectionId}`);
  });
  // Lắng nghe sự kiện đang kết nối lại
  connection.onreconnecting(error => {
      console.warn('Kết nối đang được thử lại...', error);
  });
  connection.on("GetAll", data => {   
        const obj = JSON.parse(data);
        getLogger()
        // console.log('data', obj)     
         
        // arrayMqttAuCo.push(obj)
        // console.log(arrayMqttAuCo)
                
        // if(arrayMqttAuCo.length === 4){
                      
            
        //   setMqttAuCo({   
        //       id: arrayMqttAuCo[0].LoggerId,    
        //       latitude: parseFloat(arrayMqttAuCo[0].Value),
        //       longitude: parseFloat(arrayMqttAuCo[1].Value),
        //       battery: parseInt(arrayMqttAuCo[2].Value),
        //       temperature: arrayMqttAuCo[3].Value,
        //       timestamp: arrayMqttAuCo[3].Timestamp
        //   })
          
        //   arrayMqttAuCo = []
  
        // }             
  });                      
}, [] )
                                                       
// useEffect(() => {  
//     if(mqttAuCo.id !== null){
//           getLoggerByIdFromMqtt(mqttAuCo.id)    
//     }
// },[mqttAuCo]) // có tín hiệu mqtt Au Co gửi lên

// useEffect(() => {  
//   if(LoggerGetByIdFromMqtt.id !== null){  
//     if(mqttAuCo.latitude !== 0 && mqttAuCo.longitude !== 0 ){
      
//       if(calculateDistance([10.8845, 106.7818],[mqttAuCo.latitude,mqttAuCo.longitude]) > 10) {
                         
//         UpdateLoggerMqttPublish({
//           id: LoggerGetByIdFromMqtt.id,    
//           longtitude: mqttAuCo.longitude,     
//           latitude: mqttAuCo.latitude,
//           name: LoggerGetByIdFromMqtt.name,
//           battery: mqttAuCo.battery, 
//           temperature: mqttAuCo.temperature,
//           stolen: true,
//           bluetooth: LoggerGetByIdFromMqtt.bluetooth,
//           timestamp: mqttAuCo.timestamp  
//         })

//         // postStolenLine()     
//       }
//       else{
//           UpdateLoggerMqttPublish({
//             id: LoggerGetByIdFromMqtt.id,    
//             longtitude: mqttAuCo.longitude,      
//             latitude: mqttAuCo.latitude,
//             name: LoggerGetByIdFromMqtt.name,   
//             battery: mqttAuCo.battery,  
//             temperature: mqttAuCo.temperature, 
//             stolen: false,
//             bluetooth: LoggerGetByIdFromMqtt.bluetooth,
//             timestamp: mqttAuCo.timestamp 
//           })
//           deleteStolenLineAuCo()
//       }
//     } 

//     if(mqttAuCo.latitude === 0 || mqttAuCo.longitude === 0 ){
     

//       UpdateLoggerMqttPublish({
//         id: LoggerGetByIdFromMqtt.id,    
//         longtitude: LoggerGetByIdFromMqtt.longtitude,     
//         latitude: LoggerGetByIdFromMqtt.latitude,
//         name: LoggerGetByIdFromMqtt.name,
//         battery: mqttAuCo.battery, 
//         temperature: mqttAuCo.temperature,
//         stolen: LoggerGetByIdFromMqtt.stolen,
//         bluetooth: LoggerGetByIdFromMqtt.bluetooth,
//         timestamp: mqttAuCo.timestamp  
//       })


//     }
        
//   }
// },[LoggerGetByIdFromMqtt])


const handleMapClickGetLocation = (e) => {  // lấy tọa độ khi Click vô Map
  console.log('lat: '+ e.latlng.lat)
  console.log('lng: '+ e.latlng.lng)
};

useEffect(() => { // Cập nhật bản đồ với giá trị mới của center và ZOOM_LEVEL
  if (mapRef.current) {
        mapRef.current.setView(center, zoomLevel);
  }
}, [center]);

// useEffect(() => {
//     // console.log('datalogger Chance',datalogger)
//     setCenter({ lat:  datalogger.lat, lng : datalogger.lng })
//     // localStorage.setItem('datalogger', JSON.stringify(datalogger));
// }, [datalogger]);

// useEffect(() => {
//   let i = 1
//   const interval = setInterval(() => {
//     i++
//     if(i===1){
//       setDatalogger({lat:10.77073376363716,lng:106.65862138935935});
//     }  
//     else if(i===2){
//       setDatalogger({lat:10.772950722507412,lng:106.66094404201701});
//     }
//     else{
//       i=0
//       setDatalogger({lat:10.771785,lng:106.658763 });
//     }
    
//   }, 300000);

//   return () => clearInterval(interval);
// }, []);

const currentRoutingRef = useRef(null);
const currentRoutingBattery = useRef(null);
// const handleDisplayRoute = (item) => {  // hiển thị đường đi của GPS Tracker

//   const lineStolen = item.stolenLines.map((item) => L.latLng(item.latitude, item.longtitude));
  
//   currentRoutingRef.current = L.Routing.control({
//       waypoints: [
//         // L.latLng(ListPositionSafety[0].lat, ListPositionSafety[0].lng),
//         L.latLng(10.8845, 106.7818),
//         ...lineStolen
//       ],
//       lineOptions: {
//         styles: [
//           {
//             color: "blue",
//             opacity: 1,
//             weight: 8
//           }
//         ]
//       },  
//       routeWhileDragging: true,
//       addWaypoints: false, 
//       draggableWaypoints: false,
//       fitSelectedRoutes: false,
//       showAlternatives: false,
//       show: false,
//       createMarker: function() { return null; }
    
//   });
//   currentRoutingRef.current.addTo(mapRef.current);

//   // const allWaypoints = [
//   //  ...listLocationFull
//   // ];

//   //   allWaypoints.forEach((latlng, index) => {
//   //     const marker = L.marker(latlng, { icon: positionWarning }).addTo(mapRef.current);
//   //     marker.bindPopup(`Tọa độ: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
//   //   });
// }

// const RemoveRoute = () => {   // remove đường đi GPS Tracker
//   if (currentRoutingRef.current) {
//       currentRoutingRef.current.remove();
//       currentRoutingRef.current = null;
//   }
// };

const RemoveRouteBattery = () => {   // remove đường đi thay pin GPS Tracker
  if (currentRoutingBattery.current) {
      currentRoutingBattery.current.remove();
      currentRoutingBattery.current = null;
  }
};  

const handleshowModalChangeName= (item) => {
      setshowModalChangeName(true)  // hiển thị bảng đổi tên
      setdataLoggerEdit(item)  
}

const handleCloseModalChangeName =() => { // đóng bảng đổi tên
      setshowModalChangeName(false)
      getLogger()
}


// const [listMakerStolenLine, setListMakerStolenLine] = useState([])
// useEffect(()=>{
//       RemoveRoute()
// },[dataLogerisChoose])

// useEffect(()=>{
//   if( isDisplayRouteGPS && moving){  // Khi con DataLogger di chuyển thì bám theo
//       setCenter({lat:datalogger.line[datalogger.line.length-1].lat,lng:datalogger.line[datalogger.line.length-1].lng})
//       RemoveRoute()
//       handleDisplayRoute()
//   }
      
// },[datalogger])

// console.log('datalogger',datalogger)

////////////////////////////////////////////////
// const handleMove = () => {   // Mô phỏng chuyển động GPS Tracker
//   setisWarning(true)
  
//   if (intervalId) {
//     clearInterval(intervalId);
//     setMoving(false)
//     setIntervalId(null);
//     return;
//   }
//   setMoving(true)
//   let i = 0;
//   const newIntervalId = setInterval(() => {
//     i++;
//     if(i===1){
//       const currentTime = new Date().toLocaleString();
//       setDatalogger(preLogger => ({ ...preLogger , line:[...preLogger.line, {lat: beginPosition.lat, lng: beginPosition.lng, timestamp: currentTime}]}));
//     }
//     else if (i === 2) {
//       const currentTime = new Date().toLocaleString();
//       setDatalogger(preLogger => ({ ...preLogger, lat: 10.771153882025505, lng: 106.65905203960455 , line:[...preLogger.line, {lat: 10.771153882025505, lng: 106.65905203960455, timestamp: currentTime}]  }));
//     } else if (i === 3) {
//       const currentTime = new Date().toLocaleString();
//       setDatalogger(preLogger => ({ ...preLogger, lat: 10.772012875290056, lng:  106.6577592381491, line:[...preLogger.line, {lat: 10.772012875290056, lng:  106.6577592381491, timestamp: currentTime}] }));
//     } else if (i === 4) {
//       const currentTime = new Date().toLocaleString();
//       setDatalogger(preLogger => ({ ...preLogger, lat: 10.774400125912738, lng: 106.65707806449242, line:[...preLogger.line, {lat: 10.774400125912738, lng: 106.65707806449242, timestamp: currentTime}] }));
//     } 
//     else{
//       const currentTime = new Date().toLocaleString();
//       setDatalogger(preLogger => ({ ...preLogger, lat: 10.780332703846783, lng: 106.659006148882, line:[...preLogger.line, {lat: 10.780332703846783, lng: 106.659006148882, timestamp: currentTime}] }));
//       clearInterval(newIntervalId);
//       setIntervalId(null);
//     }
//   }, 2000);
//   setIntervalId(newIntervalId);
// };



useEffect(() => {  // Dẫn đường từ vị trí người thay pin qua tất cả vị trí có mức pin cần thay
  
  RemoveRouteBattery()

  if(listLoggerBattery.length > 0 ){

    const calculateDistance = (point1, point2) => {
      const latLng1 = L.latLng(point1.latitude, point1.longtitude);
      const latLng2 = L.latLng(point2.latitude, point2.longtitude);
      const distance = latLng1.distanceTo(latLng2);
      
      return distance;
    };
    
    const findNearestNeighbor = (graph, visited, currPos, n) => {
      let minDistance = Infinity;
      let nearestNeighbor = -1;
    
      for (let i = 0; i < n; i++) {
        if (!visited[i] && graph[currPos][i] && graph[currPos][i] < minDistance) {
          minDistance = graph[currPos][i];
          nearestNeighbor = i;
        }
      }
      return nearestNeighbor;
    };
    
    const sortCitiesByNearestNeighbor = (locations, startIdx) => {
      const n = locations.length;
      const graph = Array.from({ length: n }, () => Array(n).fill(0));
    
      locations.forEach((loc, idx) => {
        locations.forEach((otherLoc, otherIdx) => {
          if (idx !== otherIdx) {
            graph[idx][otherIdx] = calculateDistance(loc, otherLoc);
          }
        });
      });
    
      const visited = Array(n).fill(false);
      const sortedCities = [];
    
      let currPos = startIdx;
      sortedCities.push(locations[currPos]);
      visited[currPos] = true;
    
      for (let count = 1; count < n; count++) {
        const nearestNeighbor = findNearestNeighbor(graph, visited, currPos, n);
        if (nearestNeighbor !== -1) {
          sortedCities.push(locations[nearestNeighbor]);
          visited[nearestNeighbor] = true;
          currPos = nearestNeighbor;
        }
      }
      return sortedCities;
    };
    
    const handleDisplayRouteBattery = () => {  
        // const newArray = [ ...listBinNeedEmpty];
        // const sortedLocations = bruteForceTSP(newArray);
        // const listLocationRepair = [locationUser.coordinates, ...sortedLocations].map(bin => L.latLng(bin.lat, bin.lng));
        const newArray = [positionUser, ...listLoggerBattery];
        
        const sortedLocations = sortCitiesByNearestNeighbor(newArray, 0);
        const listLocationFull = sortedLocations.map((bin) => L.latLng(bin.latitude, bin.longtitude));
        currentRoutingBattery.current = L.Routing.control({
            waypoints: [
               ...listLocationFull
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
        currentRoutingBattery.current.addTo(mapRef.current);      
    }

    handleDisplayRouteBattery()
  }  
},[listLoggerBattery])  // thực hiện khi danh sách thay pin thay đổi






useEffect(() => {   // Khi set được vị trí người dùng thì hiển thị marker đó lên bản đồ và di chyển map đến vị trí đó
      if( positionUser.latitude > 0){
            showMyLocation()
            setIsShowPositionUser(true)
      }
},[positionUser])



// const [currentTime, setCurrentTime] = useState(new Date());
// useEffect(() => {
//   const interval = setInterval(() => {
//     setCurrentTime(new Date());
//   }, 1000); // Cập nhật thời gian mỗi giây
//   return () => clearInterval(interval); // Xóa interval khi component bị unmount
// }, []);

const markerRef = useRef(null);

// useEffect(() => {
//   const hours = currentTime.getHours();
//   const minutes = currentTime.getMinutes();
//   const seconds = currentTime.getSeconds();
//   // Kiểm tra nếu thời gian hiện tại là 11:59 PM
//   if (hours === 15 && minutes === 48 && seconds === 30) {
//     if (markerRef.current) {     
//       markerRef.current.openPopup();     
//     }
//   }
// }, [currentTime]);
// const handleChangeStatusBlueTooth = async (DataLoggerStatusBluetooth) => {
//     try {
//     const response = await axios.patch(`${url}/Logger/UpdateLoggerStatus/Id=${DataLoggerStatusBluetooth.id}`, DataLoggerStatusBluetooth);
//     if(response && response.data){
//       if(DataLoggerStatusBluetooth.bluetooth === 'ON'){
//         toast.success('Đã bật BlueTooth')
//         getLogger()
//       }
//       else{
//         toast.success('Đã tắt BlueTooth')
//         getLogger()
//       }   
//     }
//     } catch (error) {
//         toast.error('Không thể bật BlueTooth')
//     }    
// };
// const handleChangeStolenLine = async (DataLoggerNeedDeleteStolenLine) => {
//     try {
//     const response = await axios.put(`http://localhost:3001/logger/${DataLoggerNeedDeleteStolenLine.id}`, DataLoggerNeedDeleteStolenLine);
//     if(response && response.data){
     
//         toast.success('Đã xóa dữ liệu GPS')
//         getLogger()
       
//     }
//     } catch (error) {
//         toast.error('Không thể bật BlueTooth')
//     }    
// };

// const [dataLoggerStatusBluetooth, setDataLoggerStatusBluetooth] = useState({
//   name: ""
// })
// const [dataLoggerLineStolen, setDataLoggerLineStolen] = useState({
//   name: ""
// })

// const handleBlueTooth = (item) => {
//   if(item.bluetooth === 'ON'){
//     setDataLoggerStatusBluetooth({...item, bluetooth: 'OFF'})
//   }
//   else{
//     setDataLoggerStatusBluetooth({...item, bluetooth: 'ON'})
//   }
// }    

// useEffect(()=>{
//   if(dataLoggerStatusBluetooth.name !== ''){
//     handleChangeStatusBlueTooth(dataLoggerStatusBluetooth)
//   }
// },[dataLoggerStatusBluetooth])  


// const handleDeleteGPS = (item) => {
//       // Thực hiện hành động xóa
//       if(item.stolenLine.length > 0 ){
//         setDataLoggerLineStolen({...item, stolenLine : []})
//       }
//       else{
//         alert('Không có dữ liệu GPS')
//       }
// }

// const handleConfirmDeleteGPS = (item) => {
//       setShowModalConfirmDeleteGPS(true)  // hiển thị bảng 
//       setDataLoggerLineStolen(item)  
// }

const handleCloseModalConfirmDeleteGPS = () => {
      setShowModalConfirmDeleteGPS(false)
      getLogger()
}   

function convertDateTime(inputString) {
  const [date, time] = inputString.split('T');
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year} ${time}`;
}
  
   console.log('LoggerGetByIdFromMqtt',LoggerGetByIdFromMqtt)
   console.log('mqttAuCo',mqttAuCo)    
  return (
    <>
 <div className='Map'>
                  <div className='divMap'>                   
                    <MapContainer 
                          center={center} 
                          zoom={ZOOM_LEVEL}     
                          ref={mapRef}>
                        <TileLayer
                             attribution ='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            
                        />
                        <MyClickHandlerGetLocation onClick={handleMapClickGetLocation}/>                                                       
                                {listAllLogger.map((item,index)=>(
                                  <Marker 
                                      className='maker'
                                      position={[item.latitude , item.longtitude]}
                                      icon= { wakeup } 
                                      key={index}                               
                                  >
                                     <Popup>
                                        <div className='div-popup'>
                                          <div className='infor'>
                                            <div className ='inforItem'>   
                                                <div className='title'>Tên:</div>
                                                <div className='value'>{item.name}</div>
                                            </div>    
                                            <div className ='inforItem'>
                                                <div className='title'>Mức pin:</div>
                                                <div className='value'>{`${item.battery}%`}</div>
                                            </div> 
                                            <div className ='inforItem'>
                                                <div className='title'>Kinh độ:</div>
                                                <div className='value'>{Math.round(item.latitude * 10000) / 10000}</div>
                                            </div>  
                                            <div className ='inforItem'>
                                                <div className='title'>Vĩ độ:</div>
                                                <div className='value'>{Math.round(item.longtitude * 10000) / 10000}</div>
                                            </div>
                                            <div className ='inforItem'>
                                                <div className='title'>Nhiệt độ:</div>
                                                <div className='value'>{`${item.temperature} độ C`}</div>
                                            </div>
                                            <div className ='inforItem'>
                                                <div className='title'>Thời điểm gần nhất:</div>
                                                <div className='value'>{convertDateTime(item.timeStamp)}</div>      
                                            </div>
                                            {/* <div className ='inforItem inforItemBlueTooth'>
                                                <div className='title'>Bluetooth:</div>
                                                <div className='value'>
                                                    <button className={item.bluetooth === 'ON' ? 'btnBluetoothOn' : 'btnBluetoothOff'}
                                                            onClick={() => handleBlueTooth(item)}
                                                    >{item.bluetooth}</button>
                                                </div>
                                            </div>    */}
                                            {/* <div className ='inforItem inforItemBlueTooth'>
                                                <div className='title'>Dữ liệu đường đi:</div>
                                                <div className='value'>
                                                    <button className= 'btnBluetoothOff'
                                                            onClick={() => handleConfirmDeleteGPS(item)}
                                                    >XÓA</button>
                                                </div>
                                            </div>    */}
                                          </div>
                                              
                                                                                                 
                                            <div className='button'>
                                              <button type="button" class="btn btn-primary" data-mdb-ripple-init
                                                     onClick={()=>handleshowModalChangeName(item)}
                                              >Thay đổi</button>
                                            </div>                                  
                                        </div>                                                                             
                                    </Popup>     
                                </Marker>
                                ))}

                                {listLoggerStolen.length > 0 && listLoggerStolen.map((item,index)=>(
                                  <Marker 
                                      className='maker'    
                                      position={[item.latitude , item.longtitude]}
                                      icon= { warning } 
                                      key={index}
                                      zIndexOffset={  1000 }                  
                                  >
                                    <Popup>
                                        <div className='div-popup'>
                                          <div className='infor'>
                                            <div className ='inforItem'>   
                                                <div className='title'>Tên:</div>
                                                <div className='value'>{item.name}</div>
                                            </div>    
                                            <div className ='inforItem'>
                                                <div className='title'>Mức pin:</div>
                                                <div className='value'>{`${item.battery}%`}</div>
                                            </div> 
                                            <div className ='inforItem'>
                                                <div className='title'>Kinh độ:</div>
                                                <div className='value'>{Math.round(item.latitude * 10000) / 10000}</div>
                                            </div>  
                                            <div className ='inforItem'>
                                                <div className='title'>Vĩ độ:</div>
                                                <div className='value'>{Math.round(item.longtitude * 10000) / 10000}</div>
                                            </div>
                                            <div className ='inforItem'>
                                                <div className='title'>Nhiệt độ:</div>
                                                <div className='value'>{`${item.temperature} độ C`}</div>
                                            </div>
                                            <div className ='inforItem'>
                                                <div className='title'>Thời điểm gần nhất:</div>
                                                <div className='value'>{convertDateTime(item.timeStamp)}</div>    
                                            </div>          
                                            {/* <div className ='inforItem inforItemBlueTooth'>
                                                <div className='title'>Bluetooth:</div>
                                                <div className='value'>
                                                    <button className={item.bluetooth === 'ON' ? 'btnBluetoothOn' : 'btnBluetoothOff'}
                                                            onClick={() => handleBlueTooth(item)}
                                                    >{item.bluetooth}</button>
                                                </div>
                                            </div>    */}   
                                          </div>
                                              
                                                                                                 
                                            <div className='button'>
                                              <button type="button" class="btn btn-primary" data-mdb-ripple-init
                                                     onClick={()=>handleshowModalChangeName(item)}
                                              >Thay đổi</button>
                                            </div>                                  
                                        </div>                                                                             
                                    </Popup>      
                                </Marker>
                                ))}
                          
                                {/* {isDisplayRouteGPS && listMakerStolenLine.map((item,index) => (
                                  <Marker 
                                      className='maker'
                                      position={[item.latitude , item.longtitude]}
                                      icon= { positionWarning } 
                                      key={index}                               
                                  >
                                    <Popup>
                                        <div className='div-popup'>
                                            <div>{item.timestamp}</div>                                                                    
                                        </div>                                                                             
                                    </Popup>    
                                </Marker>
                                ))} */}
                                
                                {isShowPositionUser && 
                                  <Marker 
                                      className='maker'
                                      // position={[positionUser.latitude , positionUser.longtitude]}
                                      position={[locationUser.coordinates.latitude, locationUser.coordinates.longtitude]}
                                      icon= { user }                             
                                  >
                                  </Marker>
                                }

                                {listLoggerBattery.length > 0 &&  listLoggerBattery.map((item,index)=>(
                                  <Marker 
                                      className='maker'
                                      position={[item.latitude , item.longtitude]}
                                      icon= { battery } 
                                      key={index}                               
                                  >
                                       <Popup>
                                        <div className='div-popup'>
                                          <div className='infor'>
                                            <div className ='inforItem'>   
                                                <div className='title'>Tên:</div>
                                                <div className='value'>{item.name}</div>
                                            </div>    
                                            <div className ='inforItem'>
                                                <div className='title'>Mức pin:</div>
                                                <div className='value'>{`${item.battery}%`}</div>
                                            </div> 
                                            <div className ='inforItem'>
                                                <div className='title'>Kinh độ:</div>
                                                <div className='value'>{Math.round(item.latitude * 10000) / 10000}</div>
                                            </div>  
                                            <div className ='inforItem'>
                                                <div className='title'>Vĩ độ:</div>
                                                <div className='value'>{Math.round(item.longtitude * 10000) / 10000}</div>
                                            </div>
                                            {/* <div className ='inforItem inforItemBlueTooth'>
                                                <div className='title'>Bluetooth:</div>
                                                <div className='value'>
                                                    <button className={item.bluetooth === 'ON' ? 'btnBluetoothOn' : 'btnBluetoothOff'}
                                                            onClick={() => handleBlueTooth(item)}
                                                    >{item.bluetooth}</button>
                                                </div>
                                            </div>    */}
                                          </div>
                                              
                                                                                                 
                                            <div className='button'>
                                              <button type="button" class="btn btn-primary" data-mdb-ripple-init
                                                     onClick={()=>handleshowModalChangeName(item)}
                                              >Thay đổi</button>   
                                            </div>                                  
                                        </div>                                                                             
                                    </Popup>  
                                      
                                </Marker>
                                ))}                                                      
                    </MapContainer>
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
                    <ChangeName
                           show={showModalChangeName} 
                           handleClose={handleCloseModalChangeName}   
                           dataLoggerEdit={dataLoggerEdit}                     
                    />     
                    {/* <ModelConfirm
                           show={showModalConfirmDeleteGPS} 
                           handleClose={handleCloseModalConfirmDeleteGPS}   
                           dataLoggerLineStolen={dataLoggerLineStolen}                     
                    />      */}

    </>
   
  );  
}
function MyClickHandlerGetLocation({ onClick }) {
  const map = useMapEvent('click', (e) => {
    onClick(e);
  });
  
  return null;
  }    
export default Map;