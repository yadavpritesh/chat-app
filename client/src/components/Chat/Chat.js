import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  const ENDPOINT = 'http://localhost:5000';

  const location = useLocation();

  const socket = useMemo(() => io(ENDPOINT, { transports: ['polling','flashsocket','websocket', ] }), [ENDPOINT]);

  const sendMessage = useCallback((event) => {
    event.preventDefault();
    if (message.trim()) {
      socket.emit('message', message, () => setMessage(''));
    }
  }, [message, socket]);

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
    
    setName(name);
    setRoom(room);
    console.log(room);
  
socket.emit('join', { name, room }, (response) => {
  const { error } = response || {};
  if (error) {
    alert(error);
  }
});

    return () => {
      socket.disconnect();
      socket.off('message');
    };
  }, [location.search,ENDPOINT]);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  });

  console.log(message, messages);

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name}/>
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default Chat;

