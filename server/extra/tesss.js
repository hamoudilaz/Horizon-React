const response = await fetch(process.env.RPC.URL, {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "jsonrpc": "2.0",
    "id": "test",
    "method": "getAsset",
    "params": {
      "id": ""
    }
  })
});

const data = await response.json();
const logo = data.result.content.files[0].uri;
const ticker = data.result.content.metadata.symbol;

