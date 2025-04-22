const ws = new WebSocket(import.meta.env.VITE_WS_URL);

ws.onopen = () => console.log('Connected to backend WebSocket');

ws.onclose = () => console.log('WebSocket closed');
ws.onerror = (error) => console.error('WebSocket Error:', error);

export default ws;
