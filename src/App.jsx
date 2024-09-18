// import { useEffect, useRef, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import { Terminal } from '@xterm/xterm'
// import '@xterm/xterm/css/xterm.css'
// import './App.css'

// const wss = new WebSocket('http://localhost:8000/ws')

// function App() {
//   const [count, setCount] = useState(0)
//   const terminalRef = useRef(null)

//   const term = new Terminal()

//   useEffect(()=>{
//     wss.onmessage = (event)=>{
//       const data = JSON.parse(event.data)
//       console.log(data)
//     }

//     return ()=>{
//       wss.close()
//     }
//   }, [])

//   useEffect(()=>{
//     if(!terminalRef.current) return 

//     term.open(terminalRef.current)
//     term.write('$ ')
//     term.onKey(event=>{
//       console.log(event)
//     })
//   }, [terminalRef])

//   return (
//     <>
//       <div ref={terminalRef}></div>
//     </>
//   )
// }

// export default App


import { Terminal } from "@xterm/xterm";
import React, { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";

const term = new Terminal({convertEol:true});
const ws = new WebSocket("http://localhost:8000/ws");

function App() {
  const terminalRef = useRef(null);
  const inputBuffer = useRef("");

  useEffect(() => {
    ws.onmessage = (event) => {
      let data = event.data
      console.log(data)
      if(typeof data === 'string')
      data = JSON.parse(data);

      console.log(data)
      if (data.type === "data") term.write(data.data);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;

    term.open(terminalRef.current);

    term.onKey((e) => {
      const char = e.key
      if (char === "\r") { // Enter key
        term.write("\r\n"); // Move to a new line in the terminal
        // Send the command when Enter is pressed
        ws.send(
          JSON.stringify({
            "type": "command",
            "data": inputBuffer.current,
          })
        );
        inputBuffer.current = ""; // Clear the buffer after sending
        
      } else {
        // Add the character to the buffer and update the terminal display
        inputBuffer.current += char;
        term.write(char);
      }
    });

  }, [terminalRef]);

  return <div ref={terminalRef}></div>;
}

export default App;
