import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {  toast } from 'react-toastify';
import axios from 'axios';
import './ChangeName.scss'
function ModelConfirm({ show , handleClose, dataLoggerLineStolen}) {
    const DeleteStolenLine = async () => {
        try {
        const response = await axios.put(`http://localhost:3001/logger/${dataLoggerLineStolen.id}`, {...dataLoggerLineStolen, stolenLine:[]});
        if(response && response.data){
        handleClose()
        toast.success('Xóa thành công')
        }
        } catch (error) {
            toast.error('Lỗi') ;                                                                                                                                                                                                                 
        }        
    };

    const handleDelete = () =>{
        if(dataLoggerLineStolen.stolenLine.length > 0){
            DeleteStolenLine()
        }
        else{
           
            toast.error('Không có dữ liệu GPS')
        }
    }
  return (
    <div  className="modal show"
      style={{ display: 'block', position: 'initial' , zIndex: '4000' }}>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form>
            <div className="form-group">
               Bạn có chắc chắn muốn xóa dữ liệu GPS không ?
            </div>
        </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleDelete} >
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    
    </div>
  )
}


export default ModelConfirm

