export async function sellToken(mint, amount) {
    console.log('Selling', mint, amount);
    const response = await fetch("http://localhost:3000/sell", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            outputMint: mint,
            amount: amount,
            fee: 0.000001
        })

    })
    const data = await response.json();
    console.log(data);

    return data
}

