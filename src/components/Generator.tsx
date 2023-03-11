import Qustion from './Question.js'
import type { ChatMessage } from '@/types'
import { createSignal, Index, Show, onMount, onCleanup } from 'solid-js'
import IconClear from './icons/Clear'
import IconRand from './icons/Rand'
import MessageItem from './MessageItem'
import SystemRoleSettings from './SystemRoleSettings'
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


  // onMount(() => {
  //   try {
  //     if (localStorage.getItem('messageList')) {
  //       setMessageList(JSON.parse(localStorage.getItem('messageList')))
  //     }
  //     if (localStorage.getItem('systemRoleSettings')) {
  //       setCurrentSystemRoleSettings(localStorage.getItem('systemRoleSettings'))
  //     }
  //   } catch (err) {
  //     console.error(err)
  //   }

  //   window.addEventListener('beforeunload', handleBeforeUnload)
  //   onCleanup(() => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload)
  //   })
  // })

  // const handleBeforeUnload = () => {
  //   localStorage.setItem('messageList', JSON.stringify(messageList()))
  //   localStorage.setItem('systemRoleSettings', currentSystemRoleSettings())
  // }

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
    <div my-3>
      <div class="flex items-center">
        <p mt-1 op-60>欢迎来到人工智能时代</p>
        <div onClick={randQuestion}>
          <span class="inline-flex items-center justify-center gap-1 text-sm  bg-slate/20 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-slate/50 ml-2 ">
            <IconRand />
            <span>随便问问</span>
          </span>
        </div>
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
      {currentAssistantMessage() && (
        <MessageItem
          role="assistant"
          message={currentAssistantMessage}
        />
      )}
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
    </div >
  )
}
