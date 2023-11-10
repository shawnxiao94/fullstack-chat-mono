<template>
    <a-spin :spinning="loading">
        <div class="chat">
            <div class="chat-part1" v-if="visibleTool">
                <genal-tool @logout="logout"></genal-tool>
            </div>
            <div class="chat-part2">
                <genal-search @addGroup="addGroup" @joinGroup="applyJoinGroup" @addFriend="addFriend"
                    @setActiveRoom="setActiveRoom" ref="searchRef">
                </genal-search>
                <genal-room @setActiveRoom="setActiveRoom"></genal-room>
            </div>
            <div class="chat-part3">
                <message-outlined @click="toggleDrawer" class="chat-team" />
                <div class="chat-tool">
                    <menu-fold-outlined @click="toggleTool" v-if="visibleTool" />
                    <menu-unfold-outlined @click="toggleTool" v-else />
                </div>
                <genal-message v-if="activeRoom && Object.keys(activeRoom).length"></genal-message>
            </div>
            <a-drawer class="drawer-left-list" :width="'85%'" placement="left" :closable="false" :visible="visibleDrawer"
                @close="toggleDrawer" style="height:100%"
                :bodyStyle="{ padding: '10px', backgroundColor: 'rgba(0, 0, 0, 0.1)' }">
                <div class="chat-drawer">
                    <genal-search @addGroup="addGroup" @joinGroup="applyJoinGroup" @addFriend="addFriend"
                        @setActiveRoom="setActiveRoom"> </genal-search>
                    <genal-room @setActiveRoom="setActiveRoom"></genal-room>
                </div>
            </a-drawer>
        </div>
    </a-spin>
</template>

<script setup lang="ts">
import GenalTool from './components/GenalTool.vue';
import GenalSearch from './components/GenalSearch.vue';
import GenalRoom from './components/GenalRoom.vue';
import GenalMessage from './components/GenalMessage.vue';
import { MessageOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { useRouter } from "vue-router";
const visibleTool = ref<boolean>(true)
const visibleDrawer = ref<boolean>(false)
const searchRef = ref<any>(null)

import { useChatStore } from '@/store/chat'
import { useUserStore } from '@/store/user'
const router = useRouter();


const userInfo = computed(() => {
    return useUserStore().userInfo
})
const socketInstance = computed(() => {
    return useChatStore().socket;
})
const activeRoom: any = computed(() => {
    return useChatStore().activeRoom
});
const loading: any = computed(() => {
    return useChatStore().socketStatus !== 'CONNECTED' || useChatStore().socketLoading
});
onMounted(() => {
    if (!useChatStore().socket) {
        // 进入系统初始化事件
        useChatStore().connectSocket()
    }
})
// 注销
const logout = async () => {
    await useUserStore().resetToken()
    await useChatStore().resetChat()
    router.push({
        name: 'Login',
    });
}
const addGroup = (groupName: string, notice?: string) => {
    useChatStore().setSocketLoading(true)
    socketInstance.value.emit('addGroup', {
        userId: userInfo.value.id,
        groupName,
        notice: notice ?? ''
    });
}
const applyJoinGroup = (option) => {
    useChatStore().setSocketLoading(true)
    socketInstance.value.emit('applyJoinGroup', {
        userId: userInfo.value.id,
        groupId: option?.value || option?.key,
    });
 }
const addFriend = (option) => { 
    useChatStore().setSocketLoading(true)
    socketInstance.value.emit('applyAddFriend', {
        userId: userInfo.value.id,
        friendId: option?.value || option?.key,
    });
}

// 设置当前聊天窗
const setActiveRoom = (activeRoom, flag?) => {
    useChatStore().setActiveRoom(activeRoom)
    if(flag === 'clickChange') {
        // 手动切换房间场景情况顶部搜索框内的值
        searchRef.value.selectCurrentVal = undefined
    }
}

const toggleDrawer = () => {
    visibleDrawer.value = !visibleDrawer.value
}
const toggleTool = () => {
    visibleTool.value = !visibleTool.value
}
</script>

<style lang="less" scoped>
.ant-spin-nested-loading {
    width: 100%;
    height: 100%;

    :deep(.ant-spin-container) {
        width: 100%;
        height: 100%;
    }
}

.chat {
    font-size: 16px;
    z-index: 999;
    max-width: 1000px;
    min-width: 300px;
    width: 100%;
    height: 80%;
    max-height: 900px;
    min-height: 470px;
    position: relative;
    box-shadow: 10px 20px 80px rgba(0, 0, 0, 0.8);
    display: flex;
    border-radius: 5px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;

    .chat-part1 {
        width: 74px;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
    }

    .chat-part2 {
        width: 230px;
        height: 100%;
        // background-color: rgba(0, 0, 0, 0.2);
    }

    .chat-part3 {
        flex: 1;
        height: 100%;
        // background-color: rgba(0, 0, 0, 0.2);
        overflow-y: hidden;
        position: relative;

        .chat-group {
            height: 53px;
            border-bottom: 1px solid #ccc;
            line-height: 50px;
            font-weight: bold;
        }
    }

    .chat-team {
        display: none;
    }

    .chat-tool {
        display: none;
    }
}

.chat::after {
    content: '';
    background: var(--bg-image) 0 / cover fixed;
    position: absolute;
    object-fit: cover;
    width: 100%;
    height: 100%;
    filter: blur(10px);
    transform: scale(1.08);
    z-index: -1;
}

@media screen and (max-width: 768px) {
    .chat {
        margin: 0;
        height: 100%;

        .chat-part2 {
            display: none;
        }

        .chat-team {
            display: block !important;
            position: absolute;
            font-size: 25px;
            top: 17px;
            left: 60px;
            z-index: 999;

            &:active {
                color: skyblue;
            }
        }

        .chat-tool {
            display: block !important;
            position: absolute;
            font-size: 25px;
            top: 13px;
            left: 20px;
            z-index: 999;

            &:active {
                color: skyblue;
            }
        }
    }
}
</style>