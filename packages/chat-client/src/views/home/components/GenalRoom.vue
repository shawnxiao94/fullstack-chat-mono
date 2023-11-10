<template>
  <div class="room" v-if='chatArr.length'>
    <div v-for="(chat, index) in chatArr" :key="(chat?.userId || chat?.groupId) + index" class="room-item">
      <div v-if="chat?.groupId" class="room-card" :class="{ active: activeRoom && activeRoom?.groupId === chat.groupId }"
        @click="changeActiveRoom(chat)">
        <a-badge class="room-card-badge" :count="unReadGather[chat.groupId]" />
        <img class="room-card-type" src="~@/assets/images/group.png" alt="" />
        <div class="room-card-message">
          <div class="room-card-name">{{ chat.groupName }}</div>
          <div class="room-card-new" v-if="chat.messages">
            <div class="text" v-text="_parseText(chat.messages[chat.messages.length - 1].content)"
              v-if="chat.messages[chat.messages.length - 1].messageType === 'text'"></div>
            <div class="image" v-if="chat.messages[chat.messages.length - 1].messageType === 'image'">[图片]</div>
          </div>
        </div>
      </div>
      <div v-else class="room-card"
        :class="{ active: activeRoom && !activeRoom.groupId && activeRoom.userId === chat.userId }"
        @click="changeActiveRoom(chat)">
        <a-badge class="room-card-badge" :count="unReadGather[chat.userId]" />
        <img class="room-card-type" :src="friendGather[chat.userId].avatar || avatarImg"
          :class="{ offLine: !activeUserGather.hasOwnProperty(chat.userId) }" alt="" />
        <div class="room-card-message">
          <div class="room-card-name">{{ chat?.nickName || chat.username }}</div>
          <div class="room-card-new" v-if="chat.messages">
            <div class="text" v-text="_parseText(chat.messages[chat.messages.length - 1].content)"
              v-if="chat.messages[chat.messages.length - 1].messageType === 'text'"></div>
            <div class="image" v-if="chat.messages[chat.messages.length - 1].messageType === 'image'">[图片]</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore, Group, Friend } from '@/store/chat'
import avatarImg from '@/assets/images/friend.png'
import { parseText } from '@/utils';
const DEFAULT_GROUP = '汤米聊天室';
const chatState: any = useChatStore()

interface Emits {
    (e: 'setActiveRoom', activeRom: any, flag: string): void;
}
const emit = defineEmits<Emits>();

const changeActiveRoom = (chatActiveRom) => {
  emit('setActiveRoom', chatActiveRom, 'clickChange');
  // 给某个聊天组清空未读消息
  useChatStore().clearUnReadGather(chatActiveRom?.groupId || chatActiveRom?.userId)
}

const _parseText = (text: string) => {
  return parseText(text);
}

const activeGroupUser = computed(() => {
  return useChatStore().activeGroupUser;
})
const activeUserGather = computed(() => {
  return activeGroupUser.value['groupData'] || {};
})

const activeRoom = computed(() => {
  return useChatStore().activeRoom;
})
const groupGather = computed(() => {
  return useChatStore().groupGather;
})
const friendGather = computed(() => {
  return useChatStore().friendGather;
})
const unReadGather = computed(() => {
  return useChatStore().unReadGather;
})

const chatArr: any = computed(() => {
  let groups = Object.values(groupGather.value);
  let friends = Object.values(friendGather.value);
  // 对聊天窗进行排序(根据最新消息时间)
  return [...groups, ...friends].sort((a: Group | Friend, b: Group | Friend) => {
    if (a.messages && b.messages) {
      // @ts-ignore
      return new Date(b.messages[b.messages.length - 1].updateTime).getTime() - new Date(a.messages[a.messages.length - 1].updateTime).getTime();
    }
    if (a.messages) {
      return -1;
    }
    return 1;
  });
});

onMounted(() => {


})

</script>

<style lang="less" scoped>
// @mixin button($bcolor, $url, $x1, $y1, $bor, $col) {
//   background: $bcolor;
//   -webkit-mask: url($url);
//   mask: url($url);
//   -webkit-mask-size: $x1 $y1;
//   mask-size: $x1 $y1;
//   border: $bor;
//   color: $col;
// }

.room {
  height: calc(100% - 60px);
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.1);

  .room-item{
    position: relative;
    &::after{
      position: absolute;
      left:0;
      bottom:0;
      content: '';
      display: block;
      width:100%;
      height:1px;
      transform: scale(1,0.4);
      background-color: #fafafa;
    }
  }
  .room-card {
    position: relative;
    min-height: 70px;
    display: flex;
    align-items: center;
    padding: 5px 10px;
    text-align: left;
    transition: all 0.2s linear;
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    &.active {
      background-color: rgba(0, 0, 0, 0.1);
      //   @include button(rgb(0, 0, 0, 0.5), '~@/assets/animate.png', 3000%, 100%, none, #fff);
      -webkit-animation: ani 2s steps(29) forwards;
      animation: ani 0.5s steps(29) forwards;
    }

    .room-card-badge {
      position: absolute;
      right: 10px;
      top: 10px;

      :deep(.ant-badge-count) {
        box-shadow: none;
      }
    }

    .room-card-type {
      width: 35px;
      height: 35px;
      margin-right: 5px;
      border-radius: 50%;
      object-fit: cover;

      &.offLine {
        filter: grayscale(90%);
        background: #ccc;
      }
    }

    .room-card-message {
      flex: 1;
      display: flex;
      width: 75%;
      flex-direction: column;

      .room-card-name {
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; //溢出不换行
        color: rgba(0, 0, 0, 0.8);
      }

      .room-card-new {
        >* {
          display: block;
          overflow: hidden; //超出的文本隐藏
          text-overflow: ellipsis; //溢出用省略号显示
          white-space: nowrap; //溢出不换行
        }

        color: rgba(0, 0, 0, 0.4);
        font-size: 14px;
      }
    }
  }
}

@keyframes ani {
  from {
    -webkit-mask-position: 100% 0;
    mask-position: 100% 0;
  }

  to {
    -webkit-mask-position: 0 0;
    mask-position: 0 0;
  }
}</style>