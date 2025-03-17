const ws = new WebSocket('ws://localhost:5001');

ws.onopen = () => console.log('Connected to backend WebSocket');

/* ws.onmessage = (event) => {
    const { tokenMint, tokenBalance, usdValue } = JSON.parse(event.data);
}; */

ws.onclose = () => console.log('WebSocket closed');
ws.onerror = (error) => console.error('WebSocket Error:', error);

export default ws;
