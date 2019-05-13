<template>
  <div class="rightContainer">
    <ul class="tab-tilte">
      <li @click="infoCur=0" :class="{active:infoCur==0}">基础信息</li>
      <li @click="infoCur=1" :class="{active:infoCur==1}">运行监控</li>
    </ul>
    <div class="tab-content">
      <div v-show="infoCur==0">基础信息</div>
      <div v-show="infoCur==1">
        <input type="radio" id="one" value="Week" v-model="type">
        <label for="one">周</label>
        <input type="radio" id="two" value="Month" v-model="type">
        <label for="two">月</label>

        <div class="time-tab-content">
          <div class="info">
            <v-chart class="chart2" ref="chart2" :options="orgOptions" :auto-resize="true"/>
            <!-- <chart class="chart1" ref="chart1" :options="orgOptions" :auto-resize="true"></chart> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ECharts from "vue-echarts";
import "echarts/lib/chart/line";
import "echarts/lib/chart/pie";
import "echarts/lib/chart/bar";
export default {
  name: "RightPanel",
  data() {
    return {
      type: "Week",
      infoCur: 0,
      data: {
        id: "5", //设备"id"
        name: "1", //设备名称      SHEBMC
        sbtype: "sp", //设备类型    SHEBLX
        status: "1", //设备状态     SHEBZTX
        lon: "117.9", //经度         JINGD
        lat: 34,
        PR01: "线路名称1",
        properties: {
          week: [123, 235, 345, 435, 466, 567, 255],
          month: [23421, 123532, 234676, 64377]
        }
      },
      data_w: {},

      orgOptions: {
        title: { text: "在Vue中使用echarts" },
        tooltip: {},
        xAxis: {
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        },
        yAxis: {},
        series: [
          {
            name: "销量",
            type: "bar",
            data: [5, 20, 36, 10, 10, 20, 89]
          }
        ]
      },
      cur: 0
    };
  },
  mounted() {},
  watch: {
    type(value) {
      let dLabel = [];
       let dValue = [];
      if (value == "Week") {
        dValue = this.data.properties.week;
        dLabel=["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
      } else {
        dValue = this.data.properties.month;
        dLabel=["第一周", "第二周", "第三周","第四周"]
      }
      this.orgOptions = {
        title: { text: "在Vue中使用echarts" },
        tooltip: {},
        xAxis: {
          data: dLabel
        },
        yAxis: {},
        series: [
          {
            name: "销量",
            type: "bar",
            data: dValue
          }
        ]
      };
    }
  },
  components: {
    "v-chart": ECharts
  }
};
</script>
<style scoped>
.rightContainer {
  width: 250px;
  height: 270px;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.8);
  right: 0;
  top: 30px;
}
div,
ul,
li {
  padding: 0;
  margin: 0;
}
ul li {
  list-style: none;
}
.tab-tilte {
  width: 90%;
}
.tab-tilte li {
  float: left;
  width: 50%;
  padding: 10px 0;
  text-align: center;
  background-color: #f4f4f4;
  cursor: pointer;
}
/* 点击对应的标题添加对应的背景颜色 */
.tab-tilte .active {
  background-color: #09f;
  color: #fff;
}
.tab-content {
  margin-top: 3px;
  float: left;
  width: 100%;
  height: calc(100% - 45px);
}
.tab-content > div {
  text-align: center;
  height: 100%;
}
.info {
  width: 100%;
  height: 100%;
}

.chart2 {
  width: 230px;
  height: 200px;
}
.all-count {
  color: red;
}
.time-tab-content {
  position: relative;
  height: calc(100% - 20px);
}
</style>

