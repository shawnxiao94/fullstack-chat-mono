<template>
    <a-form layout="horizontal" :model="formState" @finish="handleFinish" class="login-form">
        <a-form-item>
            <a-input v-model:value="formState.username" placeholder="账号">
                <template #prefix>
                    <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
                </template>
            </a-input>
        </a-form-item>
        <a-form-item>
            <a-input v-model:value="formState.password" type="password" placeholder="密码">
                <template #prefix>
                    <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
                </template>
            </a-input>
        </a-form-item>
        <a-form-item>
            <a-input v-model:value="formState.repassword" type="password" placeholder="确认密码">
                <template #prefix>
                    <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
                </template>
            </a-input>
        </a-form-item>
        <a-form-item>
            <a-button type="primary" html-type="submit" :disabled="!submitDisabled" :loading="loading" block
                class="login-form-button">
                确认注册
            </a-button>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import {
    UserOutlined,
    LockOutlined,
} from '@ant-design/icons-vue'

import { useUserStore } from '@/store/user'
import { message as $message, Modal } from 'ant-design-vue';
import { to } from '@/utils/awaitTo';
import { useRouter, useRoute } from "vue-router";

interface FormState {
    username: string
    password: string
    repassword: string
}
const formState: FormState = reactive({
    username: '',
    password: '',
    repassword: '',
})

const router = useRouter();
const route = useRoute();

const loading = ref(false)

const submitDisabled = computed(() => {
    return (
        formState.username &&
        formState.password &&
        formState.repassword
    )
})

const handleFinish = async () => {
    loading.value = true
    const form = toRaw(formState)
    const [err] = await to(useUserStore().register({
        ...form,
        confirmPassword: form.repassword,
        status: 1,
        sex: 1,
        "nickName": "",
        "avatar": "",
        "remark": "",
    }) as any)
    if (err) {
        Modal.error({
            title: () => '提示',
            content: () => err.message,
        });
    } else {
        $message.success('注册成功！');
        setTimeout(() => router.replace((route.query?.redirect as string) ?? '/'));
    }
    loading.value = false
    $message.destroy();
}

</script>

<style lang="less" scoped>
.login-form {
    max-width: 500px;
    min-width: 280px;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
</style>