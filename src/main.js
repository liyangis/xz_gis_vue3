import Vue from 'vue'
import App from './App.vue'
// import ECharts from 'vue-echarts/components/ECharts'
// import 'echarts/lib/chart/line'
// import 'echarts/lib/chart/pie'
// Vue.component('chart', ECharts)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
