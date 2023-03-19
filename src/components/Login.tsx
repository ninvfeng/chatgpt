import { User } from '@/types'
import type { Accessor, Setter } from 'solid-js'
import { createSignal, Index, Show, onMount, onCleanup } from 'solid-js'
interface Props {
    isLogin: Accessor<boolean>
    setIsLogin: Setter<boolean>
    user: Accessor<User>
    setUser: Setter<User>
}

export default (props: Props) => {
    let emailRef: HTMLInputElement
    let codeRef: HTMLInputElement

    const [countdown, setCountdown] = createSignal(0)

    const login = async () => {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: emailRef.value,
                code: codeRef.value,
            }),
        });
        const responseJson = await response.json();
        if (responseJson.code === 200) {
            localStorage.setItem("token", responseJson.data.token);
            localStorage.setItem("user", JSON.stringify(responseJson.data));
            props.setIsLogin(true)
            props.setUser(responseJson.data)
        } else {
        }
    }

    const sendCode = async () => {
        if (!emailRef.value) {
            alert('请输入邮箱')
        }
        setCountdown(60)
        const intv = setInterval(() => {
            setCountdown(countdown() - 1)
            if (countdown() <= 0) {
                clearInterval(intv)
            }
        }, 1000)
        const response = await fetch("/api/sendCode", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: emailRef.value,
            }),
        });
        const responseJson = await response.json();
    }

    return (
        <div id="input_container" class="mt-2 max-w-[450px]">
            <input
                ref={emailRef!}
                placeholder="邮箱"
                type="text"
                class="gpt-password-input w-full"
                value=""
            />
            <div class="flex mt-2 justify-center items-center">
                <input
                    ref={codeRef}
                    id="code_input"
                    class="gpt-password-input w-2/3"
                    placeholder="验证码"
                    v-model="data.form.verify_code"
                />
                <Show when={countdown() <= 0}>
                    <button onClick={sendCode} class="w-1/3 h-12 px-2 py-2 bg-slate bg-op-15 hover:bg-op-20 rounded-sm ml-2">
                        发送
                    </button>
                </Show>
                <Show when={countdown() > 0}>
                    <div class="w-1/3 h-12 px-2 leading-12 bg-slate bg-op-15 hover:bg-op-20 rounded-sm ml-2 text-center text-gray-400">
                        {countdown()}秒
                    </div>
                </Show>
            </div>

            <button onClick={login} class="w-1/3 h-12 mt-2 px-4 py-2 bg-slate bg-op-15 hover:bg-op-20 rounded-sm">
                开始使用
            </button>
        </div>
    )
}