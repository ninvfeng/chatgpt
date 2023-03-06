import { Show } from 'solid-js'
import type { Accessor, Setter } from 'solid-js'
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

  const handleButtonClick = () => {
    props.setCurrentSystemRoleSettings(systemInputRef.value)
    props.setSystemRoleEditing(false)
  }

  return (
    <div class="my-4">
      <Show when={!props.systemRoleEditing()}>
        <Show when={props.currentSystemRoleSettings()}>
          <div class="text-slate">
            <div class="flex items-center gap-1 op-60 text-slate">
              <IconEnv />
              <span>预设角色:</span>
            </div>
            <div class="mt-1">
              {props.currentSystemRoleSettings()}
            </div>
          </div>
        </Show>
        <Show when={!props.currentSystemRoleSettings() && props.canEdit()}>
          <span onClick={() => props.setSystemRoleEditing(!props.systemRoleEditing())} class="inline-flex items-center justify-center gap-1 text-sm text-slate bg-slate/20 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-slate/50">
            <IconEnv />
            <span>设置预设角色</span>
          </span>
        </Show>
      </Show>
      <Show when={props.systemRoleEditing() && props.canEdit()}>
        <div>
          <div class="flex items-center gap-1 op-60 text-slate">
            <IconEnv />
            <span>预设角色:</span>
          </div>
          <p class="my-2 leading-normal text-slate text-sm op-60">给你的助手添加'人'设, 它将更好为您服务</p>
          <span onClick={() => { systemInputRef.value = '我想让你充当英文翻译员,拼写纠正员和改进员, 不要回答我的提问, 仅翻译纠正和改进我说的话即可' }} class="inline-flex items-center justify-center gap-1 text-sm text-slate bg-slate/20 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-slate/50">翻译官</span>
          <span onClick={() => { systemInputRef.value = '我想让你扮演说唱歌手。您将想出强大而有意义的歌词、节拍和节奏, 让听众“惊叹”。你的歌词应该有一个有趣的含义和信息, 人们也可以联系起来。在选择节拍时, 请确保它既朗朗上口又与你的文字相关, 这样当它们组合在一起时, 每次都会发出爆炸声！不要回答我的提问, 根据我给的提示作词' }} class="inline-flex items-center justify-center gap-1 text-sm text-slate bg-slate/20 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-slate/50 ml-2">作词</span>
          <span onClick={() => { systemInputRef.value = '我给你一个app名称, 你帮我分析该APP功能模块, 优缺点, 有哪些竞争对手' }} class="inline-flex items-center justify-center gap-1 text-sm text-slate bg-slate/20 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-slate/50 ml-2">分析师</span>
          <span onClick={() => { systemInputRef.value = '我给你一段需求描述, 你用合适的编程语言把代码写出来' }} class="inline-flex items-center justify-center gap-1 text-sm text-slate bg-slate/20 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-slate/50 ml-2">程序员</span>
          <div>
            <textarea
              ref={systemInputRef!}
              placeholder="我想让你充当英文翻译员,拼写纠正员和改进员, 不要回答我的提问, 仅翻译纠正和改进我说的话即可"
              autocomplete="off"
              autofocus
              rows="3"
              w-full
              px-3 py-3 my-1
              min-h-12
              max-h-36
              text-slate
              rounded-sm
              bg-slate
              bg-op-15
              focus:bg-op-20
              focus:ring-0
              focus:outline-none
              placeholder:text-slate-400
              placeholder:op-30
              overflow-hidden
              resize-none scroll-pa-8px
            />
          </div>
          <button onClick={handleButtonClick} h-12 px-4 py-2 bg-slate bg-op-15 hover:bg-op-20 text-slate rounded-sm>
            确定
          </button>
        </div>
      </Show>
    </div>
  )
}
