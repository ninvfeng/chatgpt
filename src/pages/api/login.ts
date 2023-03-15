import type { APIRoute } from 'astro'

export const post: APIRoute = async (context) => {
    const body = await context.request.json()

    const { username, password } = body

    const response = await fetch(`${import.meta.env.API_URL}/login/login`, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            username: username,
            password: password
        }),
    })
    const text = await response.text();
    return new Response(text)
}
