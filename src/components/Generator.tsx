import Qustion from './Question.js'
import { getDate } from '@/utils/func'
import type { ChatMessage, User } from '@/types'
import { createSignal, Index, Show, onMount, onCleanup, createEffect, untrack } from 'solid-js'
import IconClear from './icons/Clear'
import IconRand from './icons/Rand'
import MessageItem from './MessageItem'
import SystemRoleSettings from './SystemRoleSettings'
import Login from './Login'
import { generateSignature } from '@/utils/auth'
import { useThrottleFn } from 'solidjs-use'

export default () => {
  let inputRef: HTMLTextAreaElement
  const [currentSystemRoleSettings, setCurrentSystemRoleSettings] = createSignal('')
  const [systemRoleEditing, setSystemRoleEditing] = createSignal(false)
  const [messageList, setMessageList] = createSignal<ChatMessage[]>([])
  const [currentAssistantMessage, setCurrentAssistantMessage] = createSignal('')
  const [loading, setLoading] = createSignal(false)
  const [controller, setController] = createSignal<AbortController>(null)
  const [timesLimit, setTimesLimit] = createSignal(50)
  const [isLogin, setIsLogin] = createSignal(true)
  const [user, setUser] = createSignal<User>({
    id: 0,
    email: '',
    nickname: '',
    times: 0,
    token: ''
  })

  onMount(async () => {
    try {
      if (localStorage.getItem(`token`)) {
        const token = localStorage.getItem(`token`)
        setIsLogin(true)
        const response = await fetch("/api/info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: localStorage.getItem(`token`)
          }),
        });
        const responseJson = await response.json();
        localStorage.setItem("user", JSON.stringify(responseJson.data));
        setUser(responseJson.data)
      } else {
        setIsLogin(false)
      }

    } catch (err) {
      console.error(err)
    }

  })

  const handleButtonClick = async () => {
    const inputValue = inputRef.value
    if (!inputValue) {
      return
    }
    // @ts-ignore
    if (window?.umami) umami.trackEvent('chat_generate')
    inputRef.value = ''
    setMessageList([
      ...messageList(),
      {
        role: 'user',
        content: inputValue,
      },
    ])
    requestWithLatestMessage()
  }

  const smoothToBottom = useThrottleFn(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }, 300, false, true)

  const requestWithLatestMessage = async () => {
    setLoading(true)
    setCurrentAssistantMessage('')
    const storagePassword = localStorage.getItem('pass')
    try {
      const controller = new AbortController()
      setController(controller)
      const requestMessageList = [...messageList()]
      if (currentSystemRoleSettings()) {
        requestMessageList.unshift({
          role: 'system',
          content: currentSystemRoleSettings(),
        })
      }
      const timestamp = Date.now()

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          messages: requestMessageList,
          time: timestamp,
          pass: storagePassword,
          token: localStorage.getItem(`token`),
          sign: await generateSignature({
            t: timestamp,
            m: requestMessageList?.[requestMessageList.length - 1]?.content || '',
          }),
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(response.statusText)
      }
      const data = response.body
      if (!data) {
        throw new Error('No data')
      }
      const reader = data.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        if (value) {
          let char = decoder.decode(value)
          if (char === '\n' && currentAssistantMessage().endsWith('\n')) {
            continue
          }
          if (char) {
            setCurrentAssistantMessage(currentAssistantMessage() + char)
          }
          smoothToBottom()
        }
        done = readerDone
      }
    } catch (e) {
      console.error(e)
      setLoading(false)
      setController(null)
      return
    }
    archiveCurrentMessage()
    user().times = user().times - Math.ceil(messageList().length / 2)
    setUser({ ...user() })
  }

  const archiveCurrentMessage = () => {
    if (currentAssistantMessage()) {
      setMessageList([
        ...messageList(),
        {
          role: 'assistant',
          content: currentAssistantMessage(),
        },
      ])
      setCurrentAssistantMessage('')
      setLoading(false)
      setController(null)
      inputRef.focus()
    }
  }

  const clear = () => {
    inputRef.value = ''
    inputRef.style.height = 'auto';
    setMessageList([])
    setCurrentAssistantMessage('')
    // setCurrentSystemRoleSettings('')
  }

  const stopStreamFetch = () => {
    if (controller()) {
      controller().abort()
      archiveCurrentMessage()
    }
  }

  const retryLastFetch = () => {
    if (messageList().length > 0) {
      const lastMessage = messageList()[messageList().length - 1]
      console.log(lastMessage)
      if (lastMessage.role === 'assistant') {
        setMessageList(messageList().slice(0, -1))
        requestWithLatestMessage()
      }
    }
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.isComposing || e.shiftKey) {
      return
    }
    if (e.key === 'Enter') {
      handleButtonClick()
    }
  }

  const randQuestion = () => {
    clear()
    inputRef.value = Qustion[Math.floor(Math.random() * Qustion.length)]
    inputRef.style.height = 'auto';
    inputRef.style.height = inputRef.scrollHeight + 'px';
    // setMessageList([
    //   ...messageList(),
    //   {
    //     role: 'user',
    //     content: Qustion[Math.floor(Math.random() * Qustion.length)],
    //   },
    // ])
    // requestWithLatestMessage()
  }

  return (
    <div my-1>
      <div>
        <Show when={!isLogin()}>
          <p mt-1 op-60>欢迎来到人工智能时代</p>
          <p mt-1 op-60>验证邮箱以获取免费额度</p>
        </Show>
      </div>
      <div class="flex items-center">
        <Show when={isLogin()}>
          <p mt-1 op-60>您好{user().nickname}, 您本月剩余额度{user().times}次</p>
        </Show>
      </div>

      <Show when={!isLogin()}>
        <Login
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          user={user}
          setUser={setUser}
        />
      </Show>

      <Show when={isLogin()}>
        <div onClick={randQuestion}>
          <span class="mt-2 inline-flex items-center justify-center gap-1 text-sm  bg-slate/20 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-slate/50">
            <IconRand />
            <span>随便问问</span>
          </span>
        </div>
        <SystemRoleSettings
          canEdit={() => messageList().length === 0}
          systemRoleEditing={systemRoleEditing}
          setSystemRoleEditing={setSystemRoleEditing}
          currentSystemRoleSettings={currentSystemRoleSettings}
          setCurrentSystemRoleSettings={setCurrentSystemRoleSettings}
        />

        <Index each={messageList()}>
          {(message, index) => (
            <MessageItem
              role={message().role}
              message={message().content}
              showRetry={() => (message().role === 'assistant' && index === messageList().length - 1)}
              onRetry={retryLastFetch}
            />
          )}
        </Index>
        {
          currentAssistantMessage() && (
            <MessageItem
              role="assistant"
              message={currentAssistantMessage}
            />
          )
        }
        <Show
          when={!loading()}
          fallback={() => (
            <div class="gen-cb-wrapper">
              <span>AI思考中...</span>
              <div class="gen-cb-stop" onClick={stopStreamFetch}>停止</div>
            </div>
          )}
        >
          <div class="gen-text-wrapper" class:op-50={systemRoleEditing()}>
            <textarea
              ref={inputRef!}
              disabled={systemRoleEditing()}
              onKeyDown={handleKeydown}
              placeholder="可输入任意问题"
              autocomplete="off"
              autofocus
              onInput={() => {
                inputRef.style.height = 'auto';
                inputRef.style.height = inputRef.scrollHeight + 'px';
              }}
              rows="1"
              class='gen-textarea'
            />
            <button onClick={handleButtonClick} disabled={systemRoleEditing()} h-12 px-2 py-2 bg-slate bg-op-15 hover:bg-op-20 rounded-sm w-20>
              发送
            </button>
            <button title="Clear" onClick={clear} disabled={systemRoleEditing()} gen-slate-btn>
              <IconClear />
            </button>
          </div>
        </Show >
      </Show>
    </div >
  )
}
