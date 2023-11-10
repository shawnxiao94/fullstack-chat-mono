<template>
    <div class="search">
        <div class="search-select">
            <a-select show-search placeholder="搜索聊天组" v-model:value="selectCurrentVal" :show-arrow="false"
                :default-active-first-option="false" :filter-option="filterOption" :not-found-content="null"
                @change="handleChange" :options="selectOptionsData">
            </a-select>
            <a-dropdown class="search-dropdown">
                <a-space><plus-circle-outlined class="search-dropdown-button" /></a-space>
                <template #overlay>
                    <a-menu>
                        <a-menu-item>
                            <div @click="() => (visibleAddGroup = !visibleAddGroup)">创建群</div>
                        </a-menu-item>
                        <a-menu-item>
                            <div @click="() => (visibleJoinGroup = !visibleJoinGroup)">搜索群</div>
                        </a-menu-item>
                        <a-menu-item>
                            <div @click="() => (visibleAddFriend = !visibleAddFriend)">搜索用户</div>
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </div>

        <a-modal v-model:visible="visibleAddGroup" footer="" title="创建群">
            <div style="display:flex;justify-content: space-between;"  v-if="visibleAddGroup">
                <a-row :gutter="[16, 16]">
                    <a-col :span="24">
                        <a-input v-model:value="groupName" placeholder="请输入群名字" allow-clear></a-input>
                    </a-col>
                    <a-col :span="24">
                        <a-textarea v-model:value="notice" placeholder="请输入群公告" allow-clear></a-textarea>
                    </a-col>
                </a-row>
                <a-button @click="addGroup" :loading="socketLoading"
                    :disabled="!groupName?.length || !nameVerify(groupName).flag" type="primary">确定</a-button>
            </div>
        </a-modal>
        <a-modal v-model:visible="visibleJoinGroup" footer="" title="搜索群">
            <div style="display:flex"  v-if="visibleJoinGroup">
                <a-select show-search :options="optionsGroup" placeholder="请输入群名字" style="width: 90%"
                    :default-active-first-option="false" label-in-value :show-arrow="false" v-model:value="searchGroupVal"
                    :filter-option="false" :not-found-content="fetchingGroup ? undefined : null"
                    @search="handleGroupSearch">
                    <template v-if="fetching" #notFoundContent>
                        <a-spin size="small"></a-spin>
                    </template>
                </a-select>
                <a-button @click="joinGroup" :loading="socketLoading" :disabled="!searchGroupVal?.value?.length" type="primary">加入群</a-button>
            </div>
        </a-modal>
        <a-modal v-model:visible="visibleAddFriend" footer="" title="搜索用户">
            <div style="display:flex" v-if="visibleAddFriend">
                <a-select show-search :options="optionsUser" placeholder="请输入用户名" style="width: 90%"
                    :default-active-first-option="false" label-in-value :show-arrow="false" v-model:value="searchUserVal"
                    :filter-option="false" :not-found-content="fetchingGroup ? undefined : null"
                    @search="handleUserSearch">
                    <template v-if="fetching" #notFoundContent>
                        <a-spin size="small"></a-spin>
                    </template>
                </a-select>
                <a-button @click="addFriend" :loading="socketLoading" :disabled="!searchUserVal?.value?.length" type="primary">添加好友</a-button>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { message as $message, Modal } from 'ant-design-vue'
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import { useChatStore, Group, Friend } from '@/store/chat'
import { nameVerify, passwordVerify } from '@/utils'
import { debounce } from 'lodash-es'
import { searchGroupKeyword, searchUserKeyword } from '@/apis/modules/account'

interface Emits {
    (e: 'setActiveRoom', activeRom: any): void;
    (e: 'addGroup', groupName: string, notice: string): void;
}
const emit = defineEmits<Emits>();

const visibleAddGroup = ref<boolean>(false)
const visibleJoinGroup = ref<boolean>(false)
const visibleAddFriend = ref<boolean>(false)
const fetchingGroup = ref<boolean>(false)

const groupName = ref<string>('')
const notice = ref<string>('')
const groupArr = ref<any[]>([])
const userArr = ref<any[]>([])
const selectCurrentVal = ref<any>(null)
const searchGroupVal = ref<string>('')
const searchUserVal = ref<string>('')
const optionsGroup = ref<any[]>([])
const optionsUser = ref<any[]>([])

let lastFetchId = 0
let lastFetchId2 = 0

defineExpose({
    selectCurrentVal
})

const groupGather = computed(() => {
    return useChatStore().groupGather;
})
const friendGather = computed(() => {
    return useChatStore().friendGather;
})
const userGather = computed(() => {
    return useChatStore().userGather;
})
const activeRoom = computed(() => {
    return useChatStore().activeRoom;
})
const socketLoading = computed(() => {
    return useChatStore().socketLoading;
})

const selectOptionsData = computed(() => {
    const arr = [...Object.values(groupGather.value), ...Object.values(friendGather.value)]
    const mySearchData = []
    for (let chat of arr) {
        if (chat.nickName) {
            mySearchData.push({
                value: chat.id,
                label: chat.nickName,
                ...chat
            })
        } else {
            mySearchData.push({
                value: chat.id,
                label: chat.groupName,
                ...chat
            });
        }
    }
    return mySearchData
})

const filterOption = (keyword: string, option: any) => {
    return option.label.toLowerCase().indexOf(keyword.toLowerCase()) >= 0
}

const handleChange = (value: string) => {
    const chatActiveRom = selectOptionsData.value.find(o => o.id === value)
    emit('setActiveRoom', chatActiveRom);
}
const addGroup = () => {
    if (!nameVerify(groupName.value)) {
        $message.warn(nameVerify(groupName.value).info)
        return;
    }
    const arr = [...Object.values(groupGather.value)]
    if (arr.some(chat => chat.groupName === groupName.value)) {
        Modal.confirm({
            title: '命名重复提示',
            content: `检测到'${groupName.value}'已经有了，是否继续新建？`,
            onOk() {
                emit('addGroup', groupName.value, notice.value);
            },
            onCancel() { }
        })
    } else {
        emit('addGroup', groupName.value, notice.value);
    }
    visibleAddGroup.value = false
}
const handleGroupSearch = debounce(async (value) => {
    if (value) {
        lastFetchId += 1
        const fetchId = lastFetchId
        optionsGroup.value = []
        fetchingGroup.value = true
        try {
            const result = await searchGroupKeyword({ keyword: value })
            if (fetchId !== lastFetchId) {
                return
            }
            if (result?.length) {
                const arr = [...Object.values(groupGather.value)]
                optionsGroup.value = result.map(r => ({
                    label: r.groupName,
                    value: r.id,
                    userId: r.userId,
                    disabled: arr.some(chat => chat.groupId === r.id)
                }))
            }
        } catch (err) {
            console.log(err)
        }
        fetchingGroup.value = false
    }
}, 500)

watch(() => searchGroupVal.value, () => {
    optionsGroup.value = []
    fetchingGroup.value = false
})
watch(() => searchUserVal.value, () => {
    optionsUser.value = []
    fetchingGroup.value = false
})

const joinGroup = () => {
    emit('joinGroup', searchGroupVal.value);
    visibleJoinGroup.value = false
 }
const handleUserSearch = debounce(async (value) => {
    if (value) {
        lastFetchId2 += 1
        const fetchId = lastFetchId2
        optionsUser.value = []
        fetchingGroup.value = true
        try {
            const result = await searchUserKeyword({ keyword: value })
            if (fetchId !== lastFetchId2) {
                return
            }
            if (result?.length) {
                const arr = [...Object.values(userGather.value)]
                optionsUser.value = result.map(r => ({
                    label: r.nickName,
                    value: r.id,
                    username: r.username,
                    disabled: arr.some(chat => chat.userId === r.id)
                }))
            }
        } catch (err) {
            console.log(err)
        }
        fetchingGroup.value = false
    }
}, 500)

const addFriend = () => {
    console.log('addFriend:', searchUserVal.value)
    emit('addFriend', searchUserVal.value);
    visibleAddFriend.value = false
 }
</script>

<style lang="less" scoped>
.search {
    position: relative;
    height: 60px;
    padding: 10px;
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.6);

    .search-select {
        width: 100%;

        .ant-select {
            width: 100%;
        }
    }

    .search-dropdown {
        position: absolute;
        right: 10px;
        top: 13px;
        width: 40px;
        height: 34px;
        font-size: 20px;
        cursor: pointer;
        line-height: 40px;
        color: gray;
        transition: 0.2s all linear;
        border-radius: 4px;
        display: flex;
        justify-content: center;

        &:hover {
            background-color: skyblue;
        }
    }
}
</style>