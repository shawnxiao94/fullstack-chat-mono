<template>
    <div class="avatar" v-if="userGather[props.msgUserInfo?.userId]">
        <a-popover v-if="userInfo?.id !== props.msgUserInfo?.userId" trigger="click">
            <template #content>
                <div class="avatar-card">
                    <a-avatar :size="60" :src="userGather[props.msgUserInfo?.userId]?.avatar" />
                    <div>{{ userGather[props.msgUserInfo?.id]?.nickName || userGather[props.msgUserInfo?.id]?.username }}</div>
                    <a-button v-if="userInfo.role === 'admin'" style="margin-bottom: 5px;"
                        @click="deleteUser(props.msgUserInfo?.userId)" type="primary">
                        删除用户
                    </a-button>
                    <a-button @click="_setActiveRoom(props.msgUserInfo?.userId)" type="primary"
                        v-if="friendGather[props.msgUserInfo?.userId]">进入私聊</a-button>
                    <a-button @click="addFriend(props.msgUserInfo?.userId)" type="primary" v-else>添加好友</a-button>
                </div>
            </template>
            <a-avatar class="avatar-img" :src="userGather[props.msgUserInfo?.userId]?.avatar || avatarImg" />
        </a-popover>
        <a-avatar v-else class="avatar-img" :src="userGather[props.msgUserInfo?.userId]?.avatar || avatarImg" />
        <div class="avatar-box">
            <span class="avatar-name">{{ userGather[props.msgUserInfo?.userId]?.nickName || userGather[props.msgUserInfo?.userId]?.username }}</span>
            <span class="avatar-time" v-if="props.showTime">{{ _formatTime(props.msgUserInfo?.updateTime).format('HH:mm')
            }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChatStore, ChatState } from '@/store/chat'
import { useUserStore } from '@/store/user'
import { momentFormat } from '@/utils';
import avatarImg from '@/assets/images/avatar1.png'

const props = defineProps({
    // 用户信息
    msgUserInfo: {
        type: null,
        default: () => null
    },
    // 是否显示时间
    showTime: {
        type: Boolean,
        default: true
    }
})
const userInfo = computed(() => {
    return useUserStore().userInfo
})

const userGather = computed(() => {
    return useChatStore().userGather
})
const friendGather = computed(() => {
    return useChatStore().friendGather
})
const currentUserInfo = computed(() => {
    return userGather.value[props.msgUserInfo?.userId]
})

const _formatTime = (time: number) => {
    return momentFormat(time);
}

const deleteUser = (d) => { }


const _setActiveRoom = (userId: string) => {
    // this.setActiveRoom(this.friendGather[userId]);
}

const addFriend = (d) => { }
</script>

<style lang="less" scoped>
.avatar {
    display: flex;
    align-items: center;
    height: 37px;

    .avatar-img {
        cursor: pointer;
        width: 35px;
        height: 35px;
    }

    .avatar-name {
        margin-left: 5px;
        color: #c9d1d9;
    }

    .avatar-time {
        font-size: 12px;
        color: #c9d1d9;
        margin-left: 3px;
    }
}

.avatar-card {
    display: flex;
    font-size: 18px;
    flex-direction: column;
    align-items: center;

    >div {
        margin: 4px;
    }
}</style>