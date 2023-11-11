<template>
    <div class="tool">
        <div class="tool-avatar">
            <div class="tool-avatar-img" @click="showUserInfo('showUserModal')">
                <img v-if="userInfo?.id" :src="userInfo?.avatar" alt="" />
            </div>
            <a-tooltip placement="bottomLeft" arrow-point-at-center>
                <template #title>
                    <div>{{ userInfo?.nickName || userInfo?.username }}</div>
                </template>
                <div class="tool-avatar-name">{{ userInfo?.nickName || userInfo?.username }}</div>
            </a-tooltip>
        </div>
        <div class="tool-icon">
            <!-- <a-tooltip placement="topLeft" arrow-point-at-center>
                <template #title>
                    <div>请文明聊天</div>
                    <div>截图粘贴可发送图片</div>
                </template>
                <a-space class="space-item"><bulb-outlined class="tool-tip icon" /></a-space>
            </a-tooltip> -->
            <!-- <a-space class="space-item">
                <skin-outlined @click="showBackgroundModal = true" class="tool-skin icon" />
            </a-space> -->
            <a href="https://github.com/shawnxiao94/fullstack-chat-mono" target="_blank" class="tool-github space-item"><github-outlined /></a>
            <a-space class="space-item">
                <a-popconfirm title="您确定要登出吗？" placement="right" ok-text="确认" cancel-text="取消" @confirm="confirmLogout"
                    @cancel="cancelLogout">
                    <poweroff-outlined class="tool-out icon" />
                </a-popconfirm>
            </a-space>
        </div>
        <a-modal title="用户信息" :visible="showUserModal" footer="" @cancel="showUserModal = false">
            <div class="tool-user">
                <div @mouseover="showUpload = true" @mouseleave="showUpload = false" class="tool-user-avatar"
                    :class="{ active: showUpload || uploading }">
                    <a-avatar v-if="userInfo?.avatar" :src="userInfo?.avatar" class="img" :size="120"></a-avatar>
                    <a-upload v-if="showUpload && !uploading" class="tool-user-upload" name="avatar"
                        :show-upload-list="false" :before-upload="beforeUpload">
                        <div class="text">
                            <cloud-upload-outlined style="margin-right: 4px;" />
                            <span>更换头像</span>
                        </div>
                    </a-upload>
                    <loading-outlined class="loading" v-if="uploading" />
                </div>
                <div class="tool-user-info" :style="{ marginBottom: '22px' }">
                    <div class="tool-user-title">更改用户昵称</div>
                    <a-input class="tool-user-input" v-model:value="nickName" placeholder="请输入用户昵称"></a-input>
                    <a-button type="primary" @click="changeNickName" :loading="updateLoading"
                        :disabled="nickName === ''">确认</a-button>
                </div>
                <div class="tool-user-info">
                    <div class="tool-user-title">更改密码</div>
                    <div class="tool-user-input">
                        <a-form :model="formState" ref="formRef" :rules="rules" :label-col="{ span: 0 }"
                            :wrapper-col="{ span: 24 }" @validate="handleValidate">
                            <a-form-item name="oldPassword">
                                <a-input-password v-model:value="formState.oldPassword" placeholder="密码">
                                    <template #prefix>
                                        <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
                                    </template>
                                </a-input-password>
                            </a-form-item>
                            <a-form-item name="password">
                                <a-input-password v-model:value="formState.password" placeholder="新密码">
                                    <template #prefix>
                                        <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
                                    </template>
                                </a-input-password>
                            </a-form-item>
                            <a-form-item name="confirmPassword">
                                <a-input-password v-model:value="formState.confirmPassword" placeholder="再次输入新密码">
                                    <template #prefix>
                                        <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
                                    </template>
                                </a-input-password>
                            </a-form-item>
                        </a-form>
                    </div>
                    <a-button type="primary" :loading="updatePwdLoading" @click="changePassword"
                        :disabled="(formState.oldPassword === '' || formState.password === '' || formState.confirmPassword === '') || formState.password === formState.oldPassword || formState.password !== formState.confirmPassword">确认</a-button>
                </div>
            </div>
        </a-modal>
        <a-modal title="主题" :visible="showBackgroundModal" footer="" @cancel="showBackgroundModal = false">
            <div class="tool-user-info">
                <div class="tool-user-title" style="width: 65px;">
                    <span>背景图</span>
                    <a-tooltip placement="topLeft" arrow-point-at-center>
                        <template #title>
                            <span>输入空格时为默认背景, 支持 jpg, png, gif等格式</span>
                        </template>
                        <exclamation-circle-outlined style="margin-left: 5px;" />
                    </a-tooltip>
                </div>
                <a-input v-model="background" class="tool-user-input" placeholder="请输入背景图片网址"></a-input>
                <a-button type="primary" @click="changeBackground">确认</a-button>
            </div>
            <div class="tool-recommend">
                <div class="recommend" @click="
                    setBackground(
                        'https://images.weserv.nl/?url=https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/23fa890c0c244db1b2d6e0927113475c~tplv-k3u1fbpfcp-zoom-1.image?imageView2/2/w/800/q/85'
                    )
                    ">
                    <img src="https://images.weserv.nl/?url=https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/23fa890c0c244db1b2d6e0927113475c~tplv-k3u1fbpfcp-zoom-1.image?imageView2/2/w/800/q/85"
                        alt="" />
                    <span class="text">阿童木</span>
                </div>
                <div class="recommend" @click="
                    setBackground('https://images.weserv.nl/?url=https://raw.githubusercontent.com/alexanderbast/vscode-snazzy/master/sample.jpg')
                    ">
                    <img src="https://images.weserv.nl/?url=https://raw.githubusercontent.com/alexanderbast/vscode-snazzy/master/sample.jpg"
                        alt="" />
                    <span class="text">VSCode摸鱼</span>
                </div>
                <div class="recommend" @click="
                    setBackground(
                        'https://images.weserv.nl/?url=https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/453b8ebcdefa46a69c620da13f346ce2~tplv-k3u1fbpfcp-zoom-1.image?imageView2/2/w/800/q/85'
                    )
                    ">
                    <img src="https://images.weserv.nl/?url=https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/453b8ebcdefa46a69c620da13f346ce2~tplv-k3u1fbpfcp-zoom-1.image?imageView2/2/w/800/q/85"
                        alt="" />
                    <span class="text">山谷</span>
                </div>
                <div class="recommend"
                    @click="setBackground('https://pic2.zhimg.com/v2-f76706d67343c66b08c937ec6bc42942_r.jpg?source=1940ef5c')">
                    <img src="https://pic2.zhimg.com/v2-f76706d67343c66b08c937ec6bc42942_r.jpg?source=1940ef5c" alt="" />
                    <span class="text">云朵</span>
                </div>
                <div class="recommend" @click="
                    setBackground(
                        'https://images.weserv.nl/?url=https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cc98cbc4ca284fc0aa509b12db0e325e~tplv-k3u1fbpfcp-zoom-1.image?imageView2/2/w/800/q/85'
                    )
                    ">
                    <img src="https://images.weserv.nl/?url=https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cc98cbc4ca284fc0aa509b12db0e325e~tplv-k3u1fbpfcp-zoom-1.image?imageView2/2/w/800/q/85"
                        alt="" />
                    <span class="text">少女</span>
                </div>
                <div class="recommend"
                    @click="setBackground('https://picb.zhimg.com/v2-263525f6c912d300abfa0eed3acbfd4b_r.jpg')">
                    <img src="https://picb.zhimg.com/v2-263525f6c912d300abfa0eed3acbfd4b_r.jpg" alt="" />
                    <span class="text">猫咪</span>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
interface Emits {
    (e: 'logout'): void;
}
const emit = defineEmits<Emits>();


import { useUserStore } from '@/store/user'
import { useChatStore } from '@/store/chat'
import { BulbOutlined, SkinOutlined, GithubOutlined, PoweroffOutlined, ExclamationCircleOutlined, CloudUploadOutlined, LoadingOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message as $message } from 'ant-design-vue'
import type { UploadProps, UploadChangeParam } from 'ant-design-vue'
import { updateAvatar, updateUserInfoById, updateUserPwdById } from '@/apis/modules/account'
import { nameVerify, passwordVerify } from '@/utils'
interface FormState {
    password: string;
    oldPassword: string;
    confirmPassword: string;
}
import type { UnwrapRef } from 'vue';
import type { FormProps } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
const showBackgroundModal = ref<boolean>(false)
let showUserModal = ref<boolean>(false)
const showUpload = ref<boolean>(false)
const uploading = ref<boolean>(false)
const nickName = ref<string>('')
const avatar = ref<any>(null)
const background = ref<string>('')
const updateLoading = ref<boolean>(false)
const updatePwdLoading = ref<boolean>(false)

const formState: UnwrapRef<FormState> = reactive({
    password: '',
    oldPassword: '',
    confirmPassword: '',
});
const validatePass = async (_rule: Rule, value: string) => {
    if (!passwordVerify(value).flag) {
        return Promise.reject(passwordVerify(value).info);
    } else {
        return Promise.resolve();
    }
};
const validatePass2 = async (_rule: Rule, value: string) => {
    if (!passwordVerify(value).flag) {
        return Promise.reject(passwordVerify(value).info);
    } else if (value === formState.oldPassword) {
        return Promise.reject("新密码不能与旧密码一样!");
    } else {
        return Promise.resolve();
    }
};
const validatePass3 = async (_rule: Rule, value: string) => {
    if (!passwordVerify(value).flag) {
        return Promise.reject(passwordVerify(value).info);
    } else if (value !== formState.password) {
        return Promise.reject("两次密码输入不一致!");
    } else {
        return Promise.resolve();
    }
};
const handleValidate = (...args) => {
    // console.log('handleValidate:',args);
};
const rules: Record<string, Rule[]> = {
    oldPassword: [{ required: true, validator: validatePass, trigger: 'change' }],
    password: [{ required: true, validator: validatePass2, trigger: 'change' }],
    confirmPassword: [{ required: true, validator: validatePass3, trigger: 'change' }],
};

const userInfo = computed(() => {
    return useUserStore().userInfo
})
const showUserInfo = (type: string) => {
    switch (type) {
        case 'showUserModal':
            showUserModal.value = !showUserModal.value
            break
    }
}
const confirmLogout = () => {
    emit('logout');
}
const cancelLogout = () => { }

const changeNickName = async () => {
    if (!nameVerify(nickName.value).flag) {
        $message.warn(nameVerify(nickName.value).info)
        return;
    }
    updateLoading.value = true
    try {
        const newUserInfo: any = await updateUserInfoById({ id: userInfo.value.id, nickName: nickName.value, role: 'user', status: 1, tag: '', remark: '', sex: 1 })
        $message.success('修改成功')
        useUserStore().updateUserInfo({ ...newUserInfo })
        // 设置所有的用户的用户详细信息(头像,昵称等)
        useChatStore().setUserGather({ ...newUserInfo, userId: newUserInfo.id })
        // 通知其他用户个人信息改变
        useChatStore().socket.emit('joinGroupSocket', {
            groupId: '', // 默认聊天室id
            userId: userInfo.value.id,
        });
    } catch (err) {
        // $message.error('请求错误'+ err)
    }
    updateLoading.value = false
}

const changePassword = async () => {
    updatePwdLoading.value = true
    updateUserPwdById({ id: userInfo.value.id, oldPassword: formState.oldPassword, password: formState.password, confirmPassword: formState.confirmPassword }).then(() => {
        $message.success('密码修改成功')
        showUserModal.value = false
    }).finally(() => {
        updatePwdLoading.value = false
    })
}
const changeBackground = () => { }
const setBackground = (src) => { }

const beforeUpload = (file: UploadProps['fileList'][number]): any => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/gif';
    if (!isJpgOrPng) {
        return $message.error('请上传jpeg/jpg/png/gif格式的图片!');
    }
    const isLt1M = file.size / 1024 / 1024 < 0.5;
    if (!isLt1M) {
        return $message.error('图片必须小于500K!');
    }
    avatar.value = file
    handleUploadAvatar()
    return false
}
// 图片上传
const handleUploadAvatar = async () => {
    uploading.value = true;
    const formData = new FormData();
    formData.append('avatar', avatar.value);
    formData.append('id', userInfo.value.id);
    try {
        const res: any = await updateAvatar(formData)
        if (res?.avatar) {
            $message.success('头像修改成功')
            showUpload.value = false
            useUserStore().updateUserInfo({ ...userInfo.value, avatar: res.avatar })
            // 通知其他用户个人信息改变
            useChatStore().socket.emit('joinGroupSocket', {
                groupId: '', // 默认聊天室id
                userId: userInfo.value.id,
            });
        }
        uploading.value = false
    } catch (err) {
        uploading.value = false
        throw err
    }

}
const getBse64 = (img, cbk) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => cbk(reader.result))
    reader.readAsDataURL(img)
}

</script>

<style lang="less" scoped>
.tool {
    padding: 10px 5px;
    height: 98%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    .tool-avatar {
        margin-top: 3px;
        width: 100%;

        .tool-avatar-img {
            margin: 0 auto;
            width: 55px;
            height: 55px;
            border-radius: 50%;
            overflow: hidden;
            cursor: pointer;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .tool-avatar-name {
            width: 100%;
            color: #fff;
            overflow: hidden; //超出的文本隐藏
            text-overflow: ellipsis; //溢出用省略号显示
            white-space: nowrap; //溢出不换行
            margin-top: 2px;
            font-size:12px;
        }
    }

    .tool-icon {
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
    }

    .tool-tip {
        bottom: 190px;
    }

    .tool-skin {
        bottom: 130px;
    }

    .tool-github {
        color: rgba(255, 255, 255, 0.85);
        bottom: 70px;
    }

    .tool-out {
        bottom: 10px;
    }


    .space-item {
        font-size: 25px;
        cursor: pointer;
        z-index: 100;
        height: 50px;
    }

    .icon {
        color: #fff;

        &:hover {
            color: skyblue;
        }
    }
}

.tool-user {
    text-align: center;
    font-size: 16px;

    .tool-user-avatar {
        position: relative;
        width: 120px;
        overflow: hidden;
        margin: 0 auto 24px;
        border-radius: 50%;
        cursor: pointer;

        .tool-user-upload {
            .text {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                line-height: 120px;
                font-weight: bold;
                color: #000;
                text-shadow: 0 0 20px #fefcc9, -20px -20px 40px #ffae34, 20px -40px 50px #ec760c, -20px -60px 60px #cd4606, 0 -80px 70px #973716, 10px -90px 80px #451b0e;
            }
        }

        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            margin: -18px 0 0 -18px;
            font-size: 35px;
            font-weight: bold;
            color: #fff;
        }

        .img {
            transition: 0.2s all linear;
        }

        &.active {
            .img {
                filter: blur(3px);
            }
        }
    }
}

.tool-user-info {
    display: flex;
    justify-content: left;
    align-items: center;

    .tool-user-input {
        flex: 1;
        margin-right: 5px;
    }

    .tool-user-title {
        display: flex;
        align-items: center;
        width: 90px;
        text-align: left;
        font-weight: bold;
        word-break: keep-all;
        margin-right: 15px;
    }

    &:nth-child(2) {
        margin-bottom: 15px;
    }
}

.tool-recommend {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    .recommend {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        width: 100px;
        height: 100px;
        margin: 15px 10px 0;
        overflow: hidden;
        cursor: pointer;
        transition: 0.3s all linear;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        span {
            position: absolute;
            color: rgba(255, 255, 255, 0.85);
            font-weight: 600;
            transition: 0.3s all linear;
            opacity: 0;
        }

        &:hover {
            box-shadow: 1px 5px 10px gray;

            span {
                opacity: 1;
            }
        }
    }
}

@media screen and (max-width: 788px) {
    .tool-recommend {
        font-size: 12px;

        .recommend {
            width: 80px;
            height: 80px;
        }
    }
}
</style>