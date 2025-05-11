export async function sellToken(mint, amount, node) {

    const response = await fetch(`${import.meta.env.VITE_API_URL}/sell`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            outputMint: mint,
            amount: amount,
            fee: node ? 0.0005 : 0.00001,
            jitoFee: node ? 0.001 : 0.00001,
            node
        })

    })
    const data = await response.json()
    return data
}