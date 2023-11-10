<template>
    <div class="active">
        <div v-if="props.type === 'group'">
            <team-outlined @click="toggleGroupUser" class="active-button" :class="{ heightLight: showGroupUser }" />
            <a-drawer placement="right" :width="'65%'" class="drawer-style-custom" :closable="false"
                :visible="showGroupUser" :bodyStyle="{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }" :get-container="getElement"
                @close="toggleGroupUser" :wrap-style="{ position: 'absolute' }">
                <div class="active-content" v-if="activeGroupUser[activeRoom.groupId]">
                    <div class="actiev-content-title">群聊管理</div>
                    <div class="descriptions-box">
                        <a-descriptions title="群公告:">
                            <a-descriptions-item>
                                {{ activeRoom?.notice }}
                            </a-descriptions-item>
                        </a-descriptions>
                    </div>
                    <div class="active-content-sum">
                        <span>群名: {{ activeRoom?.groupName }}</span>
                        <span :style="{ padding: '0 0 0 10px' }">群主: {{ userGather[activeRoom?.userId]?.nickName }}</span>
                    </div>
                    <div class="active-content-sum">人数: {{ activeNum }}</div>
                    <div class="active-content-users">
                        <div class="active-content-user" v-for="data in activeGroupUser[activeRoom.groupId]" :key="data.id">
                            <genal-avatar :msgUserInfo="{ ...data, userId: data.id }" :showTime="false"></genal-avatar>
                        </div>
                    </div>
                    <a-popconfirm title="确定要退出群聊吗？" placement="bottomRight" ok-text="Yes" cancel-text="No"
                        @confirm="exitGroup">
                        <a-button v-if="activeRoom.groupName !== DEFAULT_GROUP" danger type="primary"
                            class="active-content-out">
                            {{ activeRoom.userId === userInfo.id ? '解散该群' : '退出' }}
                        </a-button>
                    </a-popconfirm>
                </div>
            </a-drawer>
        </div>
        <div v-else>
            <a-popconfirm title="确定要删除该好友吗？" placement="bottomRight" ok-text="Yes" cancel-text="No" @confirm="exitFriend">
                <user-delete-outlined class="active-button" />
            </a-popconfirm>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/store/chat'
import { useUserStore } from '@/store/user'
import { UserDeleteOutlined, TeamOutlined } from '@ant-design/icons-vue'
import GenalAvatar from './GenalAvatar.vue'

const props = defineProps({
    type: {
        type: String,
        default: () => 'group'
    }
})
const DEFAULT_GROUP = '汤米聊天室';

const showGroupUser = ref<boolean>(false);

const userInfo = computed(() => {
    return useUserStore().userInfo
})
const socketInstance = computed(() => {
    return useChatStore().socket;
})

const userGather = computed(() => {
    return useChatStore().userGather
})
const activeGroupUser = computed(() => {
    return useChatStore().activeGroupUser
})
const activeRoom = computed(() => {
    return useChatStore().activeRoom
})
const activeNum = computed(() => {
    return Object.keys(activeGroupUser.value[activeRoom.value.groupId]).length;
})
const toggleGroupUser = () => {
    showGroupUser.value = !showGroupUser.value;
}
const getElement = () => {
    return document.getElementsByClassName('message')[0];
}
// 删除好友
const exitFriend = () => {
    socketInstance.value.emit('exitFriend', {
        userId: userInfo.value.id,
        friendId: activeRoom.value.userId,
    });
}
// 推出群聊
const exitGroup = () => {
    socketInstance.value.emit('exitGroup', {
        userId: userInfo.value.id,
        groupId: activeRoom.value.groupId,
    });
}
</script>

<style lang="less" scoped>
.active {
    position: absolute;
    width: 170px;
    right: 0;
    z-index: 100;
    border-radius: 0 0 5px 5px;

    .active-button {
        position: absolute;
        z-index: 999;
        top: -43px;
        right: 20px;
        font-size: 25px;
        cursor: pointer;

        &:active {
            color: skyblue;
        }
    }

    .active-button.heightLight {
        color: skyblue;
    }
}

::-webkit-scrollbar {
    display: none !important;
}

.drawer-style-custom {
    width: 100%;

    // 修改antd tab默认样式
    .ant-tabs-bar {
        margin: 0 0 10px 0 !important;
    }

    // 抽屉组件重写样式
    .ant-drawer-content-wrapper {
        background-color: rgba(54, 50, 50, 0.4) !important;

        .ant-drawer-content {
            background-color: rgba(0, 0, 0, 0.4) !important;

            .ant-drawer-body {
                padding: 0 !important;

                // 移动端群组部分
                .room-card {
                    background-color: rgba(115, 165, 200, 0.2);
                }

                .room-card.active {
                    background-color: rgba(115, 165, 200, 0.35);
                }

                .room-card-name {
                    color: rgba(255, 255, 255, 0.85);
                }

                .text {
                    color: rgb(238, 214, 214);
                }

                // 在线人数部分
                .active-content {
                    height: 100%;
                    overflow-y: scroll;
                    border-radius: 0 0 5px 5px;
                    text-align: left;

                    .actiev-content-title {
                        text-align: center;
                        height: 40px;
                        line-height: 40px;
                        padding: 0 12px;
                        font-size: 16px;
                        color: #fff;
                        border-bottom: 0.5px solid #c9d1d9;
                    }
                    .descriptions-box{
                        background-color: #f0f0f0;
                        padding: 10px;
                        height:104px;
                        overflow-y: scroll;
                    }

                    .active-content-sum {
                        font-weight: bold;
                        height: 40px;
                        line-height: 40px;
                        padding: 0 12px;
                    }

                    .active-content-users {
                        max-height: calc(100% - 256px);
                        overflow-y: scroll;

                        .active-content-user {
                            width: 230px;
                            overflow: hidden; //超出的文本隐藏
                            text-overflow: ellipsis; //溢出用省略号显示
                            white-space: nowrap; //溢出不换行
                            text-align: left;
                            height: 40px;
                            line-height: 40px;
                            padding: 0 12px;
                        }
                    }

                    .active-content-out {
                        margin: 12px 0 0 12px;
                    }
                }
            }
        }
    }

    .ant-drawer-mask {
        background: transparent !important;
    }
}

// antd drawer
.ant-drawer .ant-drawer-content {
    overflow: hidden;
}

.ant-drawer-body {
    height: 100%;
    overflow: hidden;
}

.chat-drawer {
    height: 100%;
    overflow: hidden;
}
</style>