import type { APIRoute } from 'astro'

export const post: APIRoute = async (context) => {
    const body = await context.request.json()

    const { email } = body

    const response = await fetch(`${import.meta.env.API_URL}/login/sendCode`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            email: email
        }),
    })
    const text = await response.text();
    return new Response(text)
}
