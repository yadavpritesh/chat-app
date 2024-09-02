import React, { useState, useEffect, useCallback, useRef } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import './Chat.css';
import { useLocation } from 'react-router-dom';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';

const Chat = () => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const location = useLocation();
  const socketRef = useRef(null);
  const ENDPOINT = 'http://localhost:5000';

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
    setName(name);
    setRoom(room);

    // Initialize socket connection
    socketRef.current = io(ENDPOINT, {
      transports: ['polling', 'flashsocket', 'websocket'],
    });

    socketRef.current.emit('join', { name, room }, (response) => {
      const { error } = response || {};
      if (error) {
        alert(error);
      }
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Properly disconnects the socket
        socketRef.current.off(); // Removes all event listeners
      }
    };
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    if (!socketRef.current) return;

    // Event listener for incoming messages
    socketRef.current.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup listener on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('message');
      }
    };
  }, []);

  const sendMessage = useCallback((event) => {
    event.preventDefault();
    if (message.trim() && socketRef.current) {
      socketRef.current.emit('message', message, () => setMessage(''));
    }
  }, [message]);

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default Chat;

