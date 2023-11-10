<template>
    <a-form layout="horizontal" :model="formState" @finish="handleFinish" id="login-form-box">
        <a-form-item>
            <a-input v-model:value="formState.username" placeholder="username">
                <template #prefix>
                    <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
                </template>
            </a-input>
        </a-form-item>
        <a-form-item>
            <a-input v-model:value="formState.password" type="password" placeholder="Password">
                <template #prefix>
                    <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
                </template>
            </a-input>
        </a-form-item>
        <a-form-item>
            <a-checkbox v-model:checked="rememberAcount">记住密码</a-checkbox>
        </a-form-item>
        <a-form-item>
            <a-button type="primary" html-type="submit" :disabled="!submitDisabled" block :loading="loading">
                登录
            </a-button>
            <div class="register-btn" @click="enterPage('Register')">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                注册
            </div>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { encrypt, decrypt } from "@/common/crypto";
import { useUserStore } from '@/store/user'
import { useChatStore } from '@/store/chat'
import { message as $message, Modal } from 'ant-design-vue';
import { to } from '@/utils/awaitTo';
import { useRouter, useRoute } from "vue-router";

interface FormState {
    username: string;
    password: string;
}
const router = useRouter();
const route = useRoute();

const formState: FormState = reactive({
    username: "",
    password: "",
});
const loading = ref(false)

const submitDisabled = computed(() => {
    return formState.username && formState.password;
});

const rememberAcount = ref(false);

watch(rememberAcount, (newValue, preValue) => {
    if (newValue) {
        localStorage.setItem("isRememberAcount", "remembered");
    } else {
        localStorage.removeItem("isRememberAcount");
    }
});

onMounted(() => {
    const isRememberAcount = localStorage.getItem("isRememberAcount");
    if (isRememberAcount) {
        const decryptText = JSON.parse(
            decrypt(localStorage.getItem("encryptText") as string)
        );
        formState.username = decryptText.username;
        formState.password = decryptText.password;
        rememberAcount.value = true;
    }
});

const handleFinish = async () => {
    loading.value = true
    const form = toRaw(formState)
    const [err]: any[] = await to(useUserStore().login({
        ...form,
    }) as any)
    if (err) {
        Modal.error({
            title: () => '提示',
            content: () => err?.msg || err.message,
        });
    } else {
        $message.success('登录成功！');
        // 进入系统初始化事件
        useChatStore().connectSocket()
        router.replace((route.query?.redirect as string) ?? '/home')
    }
    loading.value = false
    $message.destroy();
}

const enterPage = (routeName: string) => {
    localStorage.clear();
    router.push({
        name: routeName,
    });
};

</script>

<style lang="less" scoped>
#login-form-box {
    max-width: 500px;
    min-width: 280px;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .register-btn {
        position: relative;
        display: inline-block;
        width: 100%;
        padding: 4px 0;
        color: #03e9f4;
        text-align: center;
        text-decoration: none;
        overflow: hidden;
        transition: 0.5s;
        margin-top: 24px;
    }

    .register-btn:hover {
        cursor: pointer;
        background: #03e9f4;
        color: #fff;
        border-radius: 5px;
        box-shadow: 0 0 1px #03e9f4, 0 0 2px #03e9f4, 0 0 3px #03e9f4,
            0 0 6px #03e9f4;
    }

    .register-btn span {
        position: absolute;
        display: block;
    }

    .register-btn span:nth-child(1) {
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #03e9f4);
        animation: btn-anim1 1s linear infinite;
    }

    @keyframes btn-anim1 {
        0% {
            left: -100%;
        }

        50%,
        100% {
            left: 100%;
        }
    }

    .register-btn span:nth-child(2) {
        top: -100%;
        right: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(180deg, transparent, #03e9f4);
        animation: btn-anim2 1s linear infinite;
        animation-delay: 0.25s;
    }

    @keyframes btn-anim2 {
        0% {
            top: -100%;
        }

        50%,
        100% {
            top: 100%;
        }
    }

    .register-btn span:nth-child(3) {
        bottom: 0;
        right: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(270deg, transparent, #03e9f4);
        animation: btn-anim3 1s linear infinite;
        animation-delay: 0.5s;
    }

    @keyframes btn-anim3 {
        0% {
            right: -100%;
        }

        50%,
        100% {
            right: 100%;
        }
    }

    .register-btn span:nth-child(4) {
        bottom: -100%;
        left: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(360deg, transparent, #03e9f4);
        animation: btn-anim4 1s linear infinite;
        animation-delay: 0.75s;
    }

    @keyframes btn-anim4 {
        0% {
            bottom: -100%;
        }

        50%,
        100% {
            bottom: 100%;
        }
    }
}
</style>