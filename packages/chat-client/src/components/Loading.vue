<template>
    <div class="loading-box">
        <a-spin tip="正在加载中，请耐心等待"></a-spin>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="less">
.loading-box{
    width:100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background:rgba(0,0,0,0.2);

    position: absolute;
    top:0;
    left:0;
    :deep(.ant-spin-dot-item){
        background-color: #fff;
    }
    :deep(.ant-spin.ant-spin-show-text .ant-spin-text){
        color: #fff;
    }
}
</style>