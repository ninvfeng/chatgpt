import Cosplay from './Cosplay.js'
import { Show } from 'solid-js'
import type { Accessor, Setter } from 'solid-js'
import { createSignal, Index, onMount, onCleanup } from 'solid-js'
import IconEnv from './icons/Env'

interface Props {
  canEdit: Accessor<boolean>
  systemRoleEditing: Accessor<boolean>
  setSystemRoleEditing: Setter<boolean>
  currentSystemRoleSettings: Accessor<string>
  setCurrentSystemRoleSettings: Setter<string>
}

export default (props: Props) => {
  let systemInputRef: HTMLTextAreaElement

  const [cosplays, setCosplays] = createSignal<Cosplay[]>(Cosplay)
  const [cosIndex, setCosIndex] = createSignal(0)

  const handleButtonClick = () => {
    localStorage.setItem('currentCosplay', systemInputRef.value)
    props.setCurrentSystemRoleSettings(systemInputRef.value)
    props.setSystemRoleEditing(false)
  }

  const saveCosplay = () => {
    let name = window.prompt('请输入名称')
    setCosplays([
      ...cosplays(),
      {
        name: name,
        prompt: systemInputRef.value,
      },
    ])
    localStorage.setItem('cosplays', JSON.stringify(cosplays()))
  }

  const delCosplay = () => {
    setCosplays(cosplays().filter((_, i) => i !== cosIndex()))
    systemInputRef.value = ''
    localStorage.setItem('cosplays', JSON.stringify(cosplays()))
  }

  onMount(() => {
    try {
      if (localStorage.getItem('cosplays')) {
        setCosplays(JSON.parse(localStorage.getItem('cosplays')))
      }
      if (localStorage.getItem('currentCosplay')) {
        props.setCurrentSystemRoleSettings(localStorage.getItem('currentCosplay'))
      }

    } catch (err) {
      console.error(err)
    }
  })

  return (
    <div class="my-4">
      <Show when={!props.systemRoleEditing()}>
        <Show when={props.currentSystemRoleSettings()}>
          <div>
            <div class="fi gap-1 dark:op-60">
              <IconEnv />
              <span>预设角色:</span>
              <Show when={props.currentSystemRoleSettings()}>
                <span onClick={() => props.setSystemRoleEditing(!props.systemRoleEditing())} class="sys-edit-btn">
                  <span>修改</span>
                </span>
              </Show>
              <Show when={props.currentSystemRoleSettings()}>
                <span onClick={() => {
                  props.setCurrentSystemRoleSettings('')
                  localStorage.removeItem('currentCosplay')
                }} class="sys-edit-btn">
                  <span>清除</span>
                </span>
              </Show>
            </div>
            <div class="mt-1">
              {props.currentSystemRoleSettings()}
            </div>
          </div>
        </Show>
        <Show when={!props.currentSystemRoleSettings() && props.canEdit()}>
          <span onClick={() => props.setSystemRoleEditing(!props.systemRoleEditing())} class="sys-edit-btn">
            <IconEnv />
            <span>设置预设角色</span>
          </span>
        </Show>
      </Show>
      <Show when={props.systemRoleEditing() && props.canEdit()}>
        <div>
          <div class="fi gap-1 op-50 dark:op-60">
            <IconEnv />
            <span>预设角色:</span>
          </div>
          <p class="my-2 leading-normal text-sm op-50 dark:op-60">给你的助手添加'人'设, 它将更好为您服务</p>
          <div class="space-x-2 space-y-2">
            <Index each={cosplays()}>
              {(cosplay, i) => (
                <span onClick={() => {
                  systemInputRef.value = cosplay().prompt;
                  setCosIndex(i)
                }} class="inline-flex items-center justify-center gap-1 text-sm text-slate bg-slate/20 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-slate/50">{cosplay().name}</span>
              )}
            </Index>
          </div>
          <div class="mt-2">
            <textarea
              ref={systemInputRef!}
              placeholder="我想让你充当英文翻译员,拼写纠正员和改进员, 不要回答我的提问, 仅翻译纠正和改进我说的话即可"
              autocomplete="off"
              autofocus
              rows="3"
              gen-textarea
            />
          </div>
          <div class="space-x-2 mt-1">
            <button onClick={handleButtonClick} gen-slate-btn>
              确定
            </button>
            <button onClick={saveCosplay} gen-slate-btn>
              保存
            </button>
            <button onClick={delCosplay} gen-slate-btn>
              删除
            </button>
          </div>

        </div>
      </Show>
    </div>
  )
}
