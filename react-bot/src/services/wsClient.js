const ws = new WebSocket(import.meta.env.VITE_WS_URL);

ws.onopen = () => console.log('Connected to backend WebSocket');

/* ws.onmessage = (event) => {
    const { tokenMint, tokenBalance, usdValue } = JSON.parse(event.data);
    console.log(tokenMint, tokenBalance, usdValue)
}; */

ws.onclose = () => console.log('WebSocket closed');
ws.onerror = (error) => console.error('WebSocket Error:', error);

export default ws;
