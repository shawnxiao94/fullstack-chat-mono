<template>
    <div class="message-input" v-if="activeRoom">
        <a-popover placement="topLeft" trigger="hover" class="message-popver">
            <template #content>
                <a-tabs default-key="1" size="small">
                    <a-tab-pane key="1" tab="Emoji">
                        <genal-emoji @addEmoji="addEmoji"></genal-emoji>
                    </a-tab-pane>
                    <a-tab-pane key="2" tab="工具">
                        <div class="message-tool-item">
                            <a-upload :show-upload-list="false" :before-upload="beforeImgUpload">
                                <div class="message-tool-contant">
                                    <img :src="photoImg" class="message-tool-item-img" alt="" />
                                    <div class="message-tool-item-text">图片</div>
                                </div>
                            </a-upload>
                        </div>
                    </a-tab-pane>
                </a-tabs>
            </template>
            <div class="messagte-tool-icon">😃</div>
        </a-popover>
        <a-input autocomplete="off" type="text" placeholder="请输入..." v-model:value="text" ref="inputRef" autofocus
            style="color:#000;" @keyup.enter="throttle(preSendMessage)" />
        <img class="message-input-button" @click="throttle(preSendMessage)" src="~@/assets/send.png" alt="" />
    </div>
</template>

<script setup lang="ts">
// 消息类型
declare enum MessageType {
    text = 'text',
    image = 'image',
}
interface SendMessage {
    type: string;
    message: string | any;
    width?: number;
    height?: number;
    messageType: MessageType[0] | MessageType[1];
}
interface ImageSize {
    width: number;
    height: number;
}

import GenalEmoji from './GenalEmoji.vue';
import { useUserStore } from '@/store/user'
import { useChatStore } from '@/store/chat'
import photoImg from '@/assets/images/photo.png'
import { message as $message, Modal } from 'ant-design-vue';
const { proxy } = getCurrentInstance();

const text = ref<string>('');
const lastTime = ref<number>(0);

const userInfo = computed(() => {
    return useUserStore().userInfo
})
const socketInstance = computed(() => {
    return useChatStore().socket;
})
const activeRoom = computed(() => {
    return useChatStore().activeRoom;
})

onMounted(() => {
    initPaste()
})

watch(activeRoom, async (newValue, preValue) => {
    if (newValue) {
        await nextTick();
        focusInput()
    }
});
/**
 * 图片消息发送
 * @params file
 */
const handleImgUpload = (imageFile: File) => {
    const isJpgOrPng = imageFile.type === 'image/jpeg' || imageFile.type === 'image/png' || imageFile.type === 'image/jpg' || imageFile.type === 'image/gif';
    if (!isJpgOrPng) {
        return $message.error('请上传jpeg/jpg/png/gif格式的图片!');
    }
    const isLt1M = imageFile.size / 1024 / 1024 < 0.5;
    if (!isLt1M) {
        return $message.error('图片必须小于500K!');
    }
    let image = new Image();
    let url = window.URL || window.webkitURL;
    image.src = url.createObjectURL(imageFile);
    image.onload = () => {
        let imageSize: ImageSize = getImageSize({ width: image.width, height: image.height });
        sendMessage({
            type: activeRoom.value.groupId ? 'group' : 'friend',
            message: { file: imageFile, type: imageFile.type, name: imageFile.name },
            width: imageSize.width,
            height: imageSize.height,
            messageType: 'image',
        });
    };
}
/**
 * 图片上传校验
 * @params file
 */
const beforeImgUpload = (file: File) => {
    throttle(handleImgUpload, file);
    return false;
}
/**
 * 消息发送前校验
 */
const preSendMessage = () => {
    if (!text.value.trim()) {
        $message.error('不能发送空消息!');
        return;
    }
    if (text.value.length > 220) {
        $message.error('消息太长!');
        return;
    }
    if (activeRoom.value.groupId) {
        sendMessage({ type: 'group', message: text.value, messageType: 'text' });
    } else {
        sendMessage({ type: 'friend', message: text.value, messageType: 'text' });
    }
    text.value = '';
}

/**
 * 消息发送
 */
const sendMessage = (data: SendMessage) => {
    if (data.type === 'group') {
        socketInstance.value.emit('groupMessage', {
            userId: userInfo.value.id,
            groupId: activeRoom.value.groupId,
            content: data.message,
            width: data?.width,
            height: data?.height,
            messageType: data.messageType,
        });
    } else {
        socketInstance.value.emit('friendMessage', {
            userId: userInfo.value.id,
            friendId: activeRoom.value.userId,
            content: data.message,
            width: data?.width,
            height: data?.height,
            messageType: data.messageType,
        });
    }
}

/**
* 消息发送节流
*/
const throttle = (fn: Function, file?: File) => {
    let nowTime = +new Date();
    if (nowTime - lastTime.value < 500) {
        return $message.error('消息发送太频繁！');
    }
    fn(file);
    lastTime.value = nowTime;
}

/**
 * 添加emoji到input
 */
const addEmoji = (emoji: string) => {
    const inputDom = (proxy.$refs.inputRef as any).input as HTMLFormElement
    if (inputDom.selectionStart || inputDom.selectionStart === '0') {
        // 得到光标前的位置
        const startPos = inputDom.selectionStart;
        // 得到光标后的位置
        const endPos = inputDom.selectionEnd;
        // 在加入数据之前获得滚动条的高度
        const restoreTop = inputDom.scrollTop;
        // emoji表情插入至当前光标指定位置
        text.value = text.value.substring(0, startPos) + emoji + text.value.substring(endPos, text.value.length);
        // 如果滚动条高度大于0
        if (restoreTop > 0) {
            // 返回
            inputDom.scrollTop = restoreTop;
        }
        inputDom.focus();
        // 设置光标位置至emoji表情后一位
        const position = startPos + emoji.length;
        if (inputDom.setSelectionRange) {
            inputDom.focus();
            setTimeout(() => {
                inputDom.setSelectionRange(position, position);
            }, 10);
        } else if (inputDom.createTextRange) {
            const range = inputDom.createTextRange();
            range.collapse(true);
            range.moveEnd('character', position);
            range.moveStart('character', position);
            range.select();
        }
    } else {
        text.value += emoji;
        inputDom.focus();
    }
}
/**
 * 监听图片粘贴事件
 */
const initPaste = () => {
    document.addEventListener('paste', (event) => {
        let items = event.clipboardData && event.clipboardData.items;
        let url = window.URL || window.webkitURL;
        let file = null;
        if (items && items.length) {
            // 检索剪切板items
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    file = items[i].getAsFile();
                    break;
                }
            }
        }
        if (file) {
            throttle(handleImgUpload, file);
        }
    });
}
/**
* focus input框
*/
const focusInput = () => {
    // if (!mobile) {
    // @ts-ignore
    proxy.$refs.inputRef.focus();
    // }
}
/**
 * 计算图片的比例
 */
const getImageSize = (data: ImageSize) => {
    let { width, height } = data;
    if (width > 335 || height > 335) {
        if (width > height) {
            height = 335 * (height / width);
            width = 335;
        } else {
            width = 335 * (width / height);
            height = 335;
        }
    }
    return {
        width,
        height,
    };
}
</script>

<style lang="less" scoped>
.message-input {
    display: flex;
    flex-wrap: nowrap;
    position: absolute;
    width: 100%;
    bottom: 0px;

    input {
        height: 40px;
    }

    .message-input-button {
        width: 30px;
        cursor: pointer;
        position: absolute;
        right: 10px;
        top: 4px;
    }
}

//输入框样式
.ant-input {
    padding: 0 50px 0 50px;
}

// 消息工具样式
.messagte-tool-icon {
    position: absolute;
    left: 0;
    top: 0;
    width: 50px;
    height: 40px;
    text-align: center;
    line-height: 42px;
    font-size: 16px;
    cursor: pointer;
    z-index: 99;
}

.message-tool-item {
    width: 0px;
    height: 240px;
    cursor: pointer;

    .message-tool-contant {
        width: 50px;
        padding: 5px;
        border-radius: 5px;
        transition: all linear 0.2s;

        .message-tool-item-img {
            width: 40px;
        }

        .message-tool-item-text {
            text-align: center;
            font-size: 10px;
        }

        &:hover {
            background: rgba(135, 206, 235, 0.6);
        }
    }
}
</style>