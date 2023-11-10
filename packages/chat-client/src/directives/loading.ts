import {createApp,Directive} from 'vue'
import Loading from '@/components/Loading.vue'

 const loading: Directive = {
    mounted(el,binding){
        const app = createApp(Loading)
        const instance = app.mount(document.createElement('div'))
        el.instance = instance
        if(binding.value){
            appendEl(el)
        }
    },
    updated(el,binding){
        if(binding.value !== binding.oldValue){
            binding.value ? appendEl(el) : removeEl(el)
        }
    }
}

const appendEl = (el) => {
    // 给父元素加个定位，让loading元素定位
    el.style.position = 'relative';
    el?.appendChild(el.instance.$el)
}

const removeEl = (el) => {
    el.style.position = '';
    let $el = el.instance.$el
    if(el?.contains($el)){
        el?.removeChild($el)
    }
}

export default loading