import { defineStore } from 'pinia';
import store from '@/store';
import io, { type Socket } from 'socket.io-client';

import {
  EVENT_OFFLINE,
  EVENT_ONLINE,
  EVENT_TOKEN_EXPIRED,
  EVENT_TOKEN_CHECKED,
  EVENT_ONLINE_ACTIVE,
} from './ws.event';
import { LOGIN_NAME } from '@/router/constant';

import { useUserStore, UserInfo } from './user';

import { Modal, message } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { createVNode } from 'vue';

// 所有群的群信息
interface GroupGather {
  [groupId: string]: Group;
}

// 群组
export interface Group {
  id: string;
  groupId?: string;
  userId: string; // 群主id
  groupName: string;
  notice: string;
  messages?: GroupMessage[];
  createTime: number;
}

// 群与用户关联表
interface GroupMap {
  groupId: string;
  userId: string;
}

// 群消息
interface GroupMessage {
  userId: string;
  groupId: string;
  content: string;
  messageType: MessageType;
  time: number;
}

// 所有好友的好友信息
interface FriendGather {
  [userId: string]: Friend;
}

// 好友
export interface Friend {
  id: string;
  username: string;
  nickName?: string;
  avatar: string;
  role?: string;
  tag?: string;
  messages?: FriendMessage[];
  createTime: number;
}

// 用户与好友关联表
interface UserMap {
  friendId: string;
  userId: string;
}

// 好友消息
interface FriendMessage {
  userId: string;
  friendId: string;
  content: string;
  messageType: MessageType;
  time: number;
  type?: string;
}

interface SendMessage {
  type: string;
  message: string | File;
  width?: number;
  height?: number;
  messageType: MessageType[0] | MessageType[1];
}

// 消息类型
declare enum MessageType {
  text = 'text',
  image = 'image',
}

// 图片尺寸
interface ImageSize {
  width: number;
  height: number;
}

// 服务端返回值格式
interface ServerRes {
  code: number;
  msg: string;
  data: any;
}

// 所有群的在线用户合集
interface ActiveGroupUser {
  [key: string]: {
    [key: string]: UserInfo;
  };
  // @ts-ignore;
  groupData: Group;
}

// 未读消息对象
interface UnReadGather {
  [key: string]: number;
}

// 获取群分页消息参数
interface PagingParams {
  groupId?: string;
  userId?: string;
  friendId?: string;
  current: number;
  pageSize: number;
}

// 群分页消息返回值
interface PagingResponse {
  messageArr: GroupMessage[];
  userArr: UserInfo[];
}

/**
 * Socket连接状态
 */
export enum SocketStatus {
  // 连接中
  CONNECTING = 'CONNECTING',
  // 已连接
  CONNECTED = 'CONNECTED',
  // 已关闭
  CLOSE = 'CLOSE',
}

export type SocketStatusType = keyof typeof SocketStatus;

export interface ChatState {
  socket: Socket;
  socketStatus: SocketStatus;
  socketLoading: boolean;
  dropped: boolean;
  activeGroupUser: ActiveGroupUser | any;
  activeRoom: (Group & Friend) | null;
  groupGather: GroupGather;
  userGather: FriendGather;
  friendGather: FriendGather;
  unReadGather: UnReadGather;
}

var defaultName = '汤米聊天室';

export const useChatStore = defineStore('chat', {
  state: (): ChatState => {
    return {
      socket: null,
      // socket 连接状态
      socketStatus: SocketStatus.CLOSE,
      socketLoading: false,
      dropped: null, // 设置用户是否处于掉线重连状态
      activeGroupUser: {}, // 群在线人数
      activeRoom: null, // 当前聊天对象(群或好友)
      groupGather: {},
      userGather: {},
      friendGather: {},
      unReadGather: {},
    };
  },
  getters: {
    getSocket(): Socket {
      return this.socket;
    },
    getDropped(): boolean {
      return this.dropped;
    },
    getActiveRoom(): (Group & Friend) | null {
      return this.activeRoom;
    },
    getActiveGroupUser(): ActiveGroupUser {
      return this.activeGroupUser;
    },
    getGroupGather(): GroupGather {
      return this.groupGather;
    },
    getUserGather(): FriendGather {
      return this.userGather;
    },
    getFriendGather(): FriendGather {
      return this.friendGather;
    },
    getUnReadGather(): UnReadGather {
      return this.unReadGather;
    },
  },
  actions: {
    setSocket(socket) {
      this.socket = socket;
    },
    setSocketStatus(socketStatus: SocketStatusType) {
      if (this.socketStatus === socketStatus) {
        return;
      }
      this.socketStatus = socketStatus;
    },
    setActiveRoom(payload: Friend & Group) {
      // 设置当前聊天对象(群或好友)
      this.activeRoom = payload;
    },
    setGroupGather(payload) {
      // 设置所有的群的群详细信息(头像,群名字等)
      this.groupGather[payload.groupId] = payload;
    },
    // 退群
    deleteGroupGather(groupId: string) {
      Reflect.deleteProperty(this.groupGather, groupId);
    },
    // 删好友
    deleteFriendGather(friendId: string) {
      Reflect.deleteProperty(this.friendGather, friendId);
    },
    addGroupGatherMessage(payload: GroupMessage) {
      // 新增一条群消息
      if (this.groupGather[payload.groupId].messages?.length) {
        this.groupGather[payload.groupId].messages!.push(payload);
      } else {
        this.groupGather[payload.groupId].messages = [payload];
      }
    },
    addFriendGatherMessage(payload: FriendMessage) {
      // 新增一条私聊消息
      const userId = useUserStore().userInfo?.id;
      if (payload.friendId === userId) {
        if (this.friendGather[payload.userId].messages?.length) {
          this.friendGather[payload.userId].messages!.push(payload);
        } else {
          this.friendGather[payload.userId].messages = [payload];
        }
      } else {
        if (this.friendGather[payload.friendId].messages?.length) {
          this.friendGather[payload.friendId].messages!.push(payload);
        } else {
          this.friendGather[payload.friendId].messages = [payload];
        }
      }
    },
    setUserGather(payload) {
      // 设置所有的用户的用户详细信息(头像,昵称等)
      this.userGather[payload.userId] = payload;
    },
    addUnReadGather(payload: GroupMessage['groupId']) {
      // 给某个聊天组添加未读消息
      if (!this.unReadGather[payload]) {
        this.unReadGather[payload] = 1;
      } else {
        this.unReadGather[payload] += 1;
      }
    },
    clearUnReadGather(payload) {
      // 给某个聊天组清空未读消息
      this.unReadGather[payload] = 0;
    },
    setSocketLoading(payload: boolean) {
      this.socketLoading = payload;
    },
    setFriendGather(payload) {
      // 设置所有的好友的用户详细信息(头像,昵称等)
      this.friendGather[payload.userId] = payload;
    },
    setActiveGroupUser(payload: any) {
      // 设置群在线人数
      this.activeGroupUser = payload;
      const defaultGroupId = payload['groupData']?.groupName?.includes(defaultName)
        ? payload['groupData']?.id
        : '';
      if (defaultGroupId) {
        const usrArr: UserInfo[] = Object.values(payload[defaultGroupId]);
        for (let user of usrArr) {
          // 如果当前userGather没有该在线用户, 应该马上存储, 不然该在下雨用户发消息, 就看不见他的信息
          // 设置所有的用户的用户详细信息(头像,昵称等)
          const userInfo1 = payload[defaultGroupId][user?.id];
          this.setUserGather({ ...userInfo1, userId: user.id });
        }
      }
    },
    resetChat() {
      this.activeGroupUser = {}; // 群在线人数
      this.activeRoom = null; // 当前聊天对象(群或好友)
      this.groupGather = {};
      this.userGather = {};
      this.friendGather = {};
      this.unReadGather = {};
      this.socketStatus = SocketStatus.CLOSE
      this.socket = null
      this.dropped = null
    },
    /** 初始化socket连接和监听socket事件 */
    async connectSocket() {
      const userStore = useUserStore();
      const socketInstance: Socket = io(`${import.meta.env.VITE_APP_BASE_SOCKET_URL}`, {
        path: import.meta.env.VITE_APP_BASE_SOCKET_PATH, // 指定WebSocket服务器的路径
        transports: ['websocket'],
        query: { token: userStore.token, userId: userStore.userInfo?.id },
      } as any);

      socketInstance.on(EVENT_TOKEN_CHECKED, async (res) => {
        if (res?.code === 200) {
          // 获取聊天室所需所有信息
          socketInstance.emit('chatAllData', userStore.userInfo.id);
          // 先保存好socket对象
          this.setSocket(socketInstance);
          this.setSocketStatus(SocketStatus.CONNECTED);
        } else {
          this.setSocketStatus(SocketStatus.CLOSE);
          Modal.warn({
            title: '提示',
            icon: createVNode(ExclamationCircleOutlined),
            content: res?.msg || res?.message,
            okText: '去登录',
            onOk() {
              window.localStorage.clear();
              userStore.resetToken();
              window.location.hash = '/login';
            },
          });
        }
      });

      socketInstance.on('chatAllData', async (res) => {
        if (res.code === 200) {
          if (!res?.data) {
            Modal.warn({
              title: '提示',
              icon: createVNode(ExclamationCircleOutlined),
              content: '当前用户不存在或已经删除',
              okText: '去重新登录',
              onOk() {
                window.localStorage.clear();
                userStore.resetToken();
                window.location.hash = '/login';
              },
            });
          } else {
            // 所有群
            let groupArr = res.data.groupData;
            // 所有好友
            let friendArr = res.data.friendData;
            //  所有用户
            let userArr = res.data.userData;
            if (groupArr.length) {
              for (let group of groupArr) {
                socketInstance.emit('joinGroupSocket', {
                  groupId: group.id,
                  userId: userStore.userInfo?.id,
                });
                // 设置所有的群的群详细信息(头像,群名字等)
                this.setGroupGather({ ...group, groupId: group.id });
              }
            }
            if (friendArr.length) {
              for (let friend of friendArr) {
                socketInstance.emit('joinFriendSocket', {
                  userId: userStore.userInfo?.id,
                  friendId: friend.id,
                });
                // 设置所有的好友的用户详细信息(头像,昵称等)
                this.setFriendGather({ userId: friend.id, ...friend });
              }
            }
            if (userArr.length) {
              for (let user of userArr) {
                // 设置所有的用户的用户详细信息(头像,昵称等)
                this.setUserGather({ ...user, userId: user.id });
              }
            }
            /**
             * 由于groupgather和userGather都更新了, 但是activeGather依旧是老对象,
             * 这里需要根据老的activeGather找到最新的gather对象,这样才能使得vue的watch监听新gather
             */
            let activeRoom = this.activeRoom;
            let groupGather2 = this.groupGather;
            let friendGather2 = this.friendGather;
            if (!activeRoom) {
              // 更新完数据没有默认activeRoom设置群为'叨郎聊天室'
              const arr: Group[] = Object.values(this.groupGather);
              const activeRoom = arr?.find((a) => a?.groupName?.includes(defaultName));
              Object.values(activeRoom).length && this.setActiveRoom(activeRoom);
              return;
            }
            this.setActiveRoom(
              groupGather2[activeRoom.groupId] || friendGather2[activeRoom.userId],
            );
          }
        }
      });

      // 加入群组的socket连接
      socketInstance.on('joinGroupSocket', async (res) => {
        if (res.code === 200) {
          let newUser: Friend = res.data.user;
          let group: Group = res.data.group;
          let friendGather = JSON.parse(JSON.stringify(this.friendGather));
          if (newUser.id !== userStore.userInfo?.id) {
            // 设置所有的用户的用户详细信息(头像,昵称等)
            this.setUserGather({ ...newUser, userId: newUser.id });
            if (friendGather[newUser.id]) {
              // 当用户的好友更新了用户信息
              let messages;
              if (friendGather[newUser.id].messages) {
                messages = friendGather[newUser.id].messages;
              }
              // 设置所有的好友的用户详细信息(头像,昵称等)
              this.setFriendGather({ userId: newUser.id, ...newUser });
              // 设置私聊记录
              if (messages?.length) {
                if (messages[0].friendId === userStore.userInfo?.id) {
                  // 设置好友的用户详细信息(头像,昵称等)
                  friendGather[messages[0].userId].messages = messages;
                  this.setFriendGather(friendGather);
                } else {
                  friendGather[messages[0].friendId].messages = messages;
                  this.setFriendGather(friendGather);
                }
              }
            }
            // @ts-ignore 解决重复进群消息问题
            if (window.msg === newUser.id) {
              return;
            }
            // @ts-ignore
            window.msg = newUser.id;
            return message.info(`${newUser.username}加入群${group.groupName}`);
          } else {
            if (!this.groupGather[group.id]) {
              // 设置所有的用户的用户详细信息(头像,名字等)
              this.setGroupGather({ ...group, groupId: group.id });
            }
            this.setUserGather({ ...newUser, userId: newUser.id });
          }
        }
      });

      socketInstance.on('joinFriendSocket', async (res) => {
        // console.log('joinFriendSocket:', res);
      });
      // 群消息
      socketInstance.on('groupMessage', async (res) => {
        if (res.code === 200) {
          this.addGroupGatherMessage(res.data);
          if (this.activeRoom.groupId !== res.data.groupId) {
            // 给聊天室添加未读消息
            this.addUnReadGather(res.data.groupId);
          }
        } else {
          message.error(res?.msg);
        }
      });
      // 私聊消息
      socketInstance.on('friendMessage', async (res) => {
        if (res.code === 200) {
          if (
            res.data.friendId === userStore.userInfo?.id ||
            res.data.userId === userStore.userInfo?.id
          ) {
            this.addFriendGatherMessage(res.data);
          }
          if (
            this.activeRoom.userId !== res.data.userId &&
            this.activeRoom.userId !== res.data.friendId
          ) {
            // 给私聊添加未读消息
            this.addUnReadGather(res.data.userId);
          }
        } else {
          message.error(res?.msg);
        }
      });
      // 创建群组
      socketInstance.on('addGroup', async (res) => {
        if (res.code === 200) {
          // 设置所有的群的群详细信息(头像,群名字等)
          this.setGroupGather({ ...res.data, groupId: res.data?.id });
          message.success(res?.msg);
        } else {
          message.error(res?.msg);
        }
        this.setSocketLoading(false);
      });
      // 加入群组
      socketInstance.on('applyJoinGroup', async (res) => {
        if (res.code === 200) {
          if (res.data.user.id !== userStore.userInfo?.id) {
            // 设置所有的群的群详细信息(头像,群名字等)
            this.setUserGather({ ...res.data.user, userId: res.data.user.id });
            message.success(res?.msg);
          } else {
            // 是用户自己 则加入到某个群
            if (!this.groupGather[res.data.group.id]) {
              // 设置所有的群的群详细信息(头像,群名字等)
              this.setGroupGather({ ...res.data.group, groupId: res.data?.group.id });
              // 获取群里面所有用户的用户信息
              socketInstance.emit('chatAllData', userStore.userInfo.id);
            }
            this.setActiveRoom(this.groupGather[res.data.group.id]);
            message.success(`成功加入群${res.data.group.groupName}`);
          }
        } else {
          message.error(res?.msg);
        }
        this.setSocketLoading(false);
      });
      // 加好友
      socketInstance.on('applyAddFriend', async (res) => {
        if (res.code === 200) {
          // 设置所有的群的群详细信息(头像,群名字等)
          this.setUserGather({
            ...res.data.user,
            userId: res.data.user.id,
            messages: res?.data?.messages,
          });
          // 设置所有的好友的用户详细信息(头像,昵称等)
          this.setFriendGather({
            ...res.data.friend,
            userId: res.data.friend.id,
            messages: res?.data?.messages,
          });
          message.success(res?.msg);
          socketInstance.emit('joinFriendSocket', {
            userId: userStore.userInfo?.id,
            friendId: res?.data?.user?.id,
          });
        } else {
          message.error(res?.msg);
        }
        this.setSocketLoading(false);
      });
      // 退群
      socketInstance.on('exitGroup', async (res) => {
        if (res.code === 200) {
          res?.data?.groupId && this.deleteGroupGather(res.data.groupId);
          // 更新完数据没有默认activeRoom设置群为'汤米聊天室'
          const arr: Group[] = Object.values(this.groupGather);
          const activeRoom = arr?.find((a) => a?.groupName?.includes(defaultName));
          Object.values(activeRoom).length && this.setActiveRoom(activeRoom);
          message.success(res?.msg);
        } else {
          message.error(res?.msg);
        }
      });
      // exitFriend 删好友
      socketInstance.on('exitFriend', async (res) => {
        if (res.code === 200) {
          res?.data?.friendId && this.deleteFriendGather(res.data.friendId);
          // 更新完数据没有默认activeRoom设置群为'汤米聊天室'
          const arr: Group[] = Object.values(this.groupGather);
          const activeRoom = arr?.find((a) => a?.groupName?.includes(defaultName));
          Object.values(activeRoom).length && this.setActiveRoom(activeRoom);
          message.success(res?.msg);
        } else {
          message.error(res?.msg);
        }
      });

      // 初始化监听当前状态数据
      socketInstance.on(EVENT_ONLINE_ACTIVE, async (res) => {
        if (res.code === 200 && Object.keys(res.data.activeGroupUserGather)) {
          // 设置群在线人数
          this.setActiveGroupUser(res.data.activeGroupUserGather);
        }
      });

      socketInstance.on('disconnect', async (res) => {
        this.setSocketStatus(SocketStatus.CLOSE);
      });
    },
  },
  // 开启数据持久化
  persist: true,
});

// 在组件setup函数外使用
export function useUserStoreWithOut() {
  return useUserStore(store);
}
