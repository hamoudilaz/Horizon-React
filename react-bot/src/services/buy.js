export async function executeSwap(params) {
    try {

        const sendReq = await fetch(`${import.meta.env.VITE_API_URL}/buy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const data = await sendReq.json();

        if (data.error) {
            console.error('Server error:', data.error);
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error('Fetch error:', error.message);
        return { error: error.message };
    }
}



export async function copy(params) {
    try {
        console.log(params)
        const sendReq = await fetch(`${import.meta.env.VITE_API_URL}/api/copytrade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const data = await sendReq.json();

        if (data.error) {
            console.error('Server error:', data.error);
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error('Fetch error:', error.message);
        return { error: error.message };
    }
}
