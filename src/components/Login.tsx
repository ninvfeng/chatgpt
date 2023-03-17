export default () => {
    let emailRef: HTMLInputElement
    let codeRef: HTMLInputElement


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
        console.log(responseJson);
        if (responseJson.code === 200) {
            localStorage.setItem("token", responseJson.data.token);
            localStorage.setItem("user", JSON.stringify(responseJson.data));
            window.location.href = "/";
        } else {
        }
    }

    const sendCode = async () => {
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
        console.log(responseJson);
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
                <button onClick={sendCode} class="w-1/3 h-12 px-2 py-2 bg-slate bg-op-15 hover:bg-op-20 rounded-sm ml-2">
                    发送
                </button>
            </div>

            <button onClick={login} class="w-1/3 h-12 mt-2 px-4 py-2 bg-slate bg-op-15 hover:bg-op-20 rounded-sm">
                注册/登录
            </button>
        </div>
    )
}