import type { APIRoute } from 'astro'

export const post: APIRoute = async (context) => {
    const body = await context.request.json()

    const { token } = body

    const response = await fetch(`${import.meta.env.API_URL}/api/gpt/info`, {
        headers: {
            'Content-Type': 'application/json',
            'Token': token,
            'Appkey': import.meta.env.APP_KEY,
        },
        method: 'GET',
    })
    const text = await response.text();
    return new Response(text)
}
