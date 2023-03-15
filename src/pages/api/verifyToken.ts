import type { APIRoute } from 'astro'
const API_URL = import.meta.env.API_URL

export const post: APIRoute = async (context) => {
    const body = await context.request.json()

    const { token } = body

    const response = await fetch(`${API_URL}/login/verifyToken`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            token: token
        }),
    })
    const text = await response.text();
    return new Response(text)
}
