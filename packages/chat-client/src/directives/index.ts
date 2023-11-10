import type {App} from 'vue'
import  clickOutside from './clickOutside'
import  loading from './loading'

const directives: any = {
    clickOutside,
    loading
}

export default {
    install(app: App<Element>) {
        Object.keys(directives).forEach((key:string) => {
            app.directive(key,directives[key])
        })
    }
}