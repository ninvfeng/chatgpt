import type { APIRoute } from 'astro'
import { generatePayload, parseOpenAIStream } from '@/utils/openAI'
import { verifySignature } from '@/utils/auth'
// #vercel-disable-blocks
import { fetch, ProxyAgent } from 'undici'
// #vercel-end

const apiKey = import.meta.env.OPENAI_API_KEY
const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = (import.meta.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/, '')
const sitePassword = import.meta.env.SITE_PASSWORD
const API_URL = import.meta.env.API_URL

export const post: APIRoute = async (context) => {

  const body = await context.request.json()
  const { sign, time, messages, pass, token } = body
  if (!messages) {
    return new Response('No input text')
  }

  // if (sitePassword && sitePassword !== pass) {
  //   return new Response('Invalid password')
  // }

  if (import.meta.env.PROD && !await verifySignature({ t: time, m: messages?.[messages.length - 1]?.content || '', }, sign)) {
    return new Response('Invalid signature')
  }
  const initOptions = generatePayload(apiKey, messages)
  // #vercel-disable-blocks
  if (httpsProxy) {
    initOptions['dispatcher'] = new ProxyAgent(httpsProxy)
  }
  // #vercel-end

  console.log(token)

  // 消耗次数
  const useRes = await fetch(`${API_URL}/api/gpt/consume`, {
    headers: {
      'Content-Type': 'application/json',
      'Token': token
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      token: JSON.stringify(messages).length * 4,
      times: Math.ceil(messages.length / 2),
      app_key: import.meta.env.APP_KEY
    }),
  })
  const res = await useRes.text();
  const resJson = JSON.parse(res)
  if (resJson.code !== 200) {
    return new Response(resJson.message)
  }

  // @ts-ignore
  const response = await fetch(`${baseUrl}/v1/chat/completions`, initOptions) as Response

  return new Response(parseOpenAIStream(response))
}
