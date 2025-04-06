export async function sellToken(mint, amount) {



    const response = await fetch(`${import.meta.env.VITE_API_URL}/sell`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            outputMint: mint,
            amount: amount,
            fee: 0.000001,
            jitoFee: 0.000001

        })

    })
    const data = await response.json()
    return data
}