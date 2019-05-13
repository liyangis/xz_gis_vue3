<template>
  <div class="bottomContainer">
    <ul class="tab-tilte">
      <li @click="cur=0" :class="{active:cur==0}">周</li>
      <li @click="cur=1" :class="{active:cur==1}">月</li>
    </ul>
    <div class="tab-content">
      <div class="info">
        <div>
          交通总流量
          <span class="all-count">{{data.t1.value}}辆</span>
        </div>
        <v-chart class="chart1" ref="chart1" :options="data.orgOptions" :auto-resize="true"/>
        <!-- <chart class="chart1" ref="chart1" :options="orgOptions" :auto-resize="true"></chart> -->
      </div>
      <div class="info">
        <div class="title1">{{data.t2.txt}}</div>
        <ul>
          <li v-for="item in data.value" :value="item.txt" :key="item.id">
            {{item.txt}}
            <a :href="item.url" target="_blank">详情</a>
          </li>
        </ul>
      </div>
      <div class="info">
        <div class="title2">{{data.t3.txt}}</div>
        <ul>
          <li v-for="item in data.value" :value="item.txt" :key="item.id">
            {{item.txt}}
            <a :href="item.url" target="_blank">详情</a>
          </li>
        </ul>
      </div>
      <div class="info">
        <div class="title3">{{data.t4.txt}}</div>
        <ul>
          <li v-for="item in data.value" :value="item.txt" :key="item.id">
            {{item.txt}}
            <a :href="item.url" target="_blank">详情</a>
          </li>
        </ul>
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
  name: "BottomPanel",
  data() {
    return {
      type: "month",
      data: {
        t1: {
          value: 120,
          n1: "10",
          n2: "90"
        },
        t2: {
          txt: "交通量前三",
          color: "red"
        },
        t3: {
          txt: "货车前三",
          color: "red"
        },
        t4: {
          txt: "速度后三",
          color: "red"
        },
        orgOptions: {
          title: {
            text: "交通总流量",
            x: "center"
          },
          legend: {
            orient: "vertical",
            x: "left",
            data: ["小汽车", "货车"]
          },
          series: [
            {
              name: "交通总流量",
              type: "pie",
              radius: "55%",
              center: ["50%", "60%"],
              data: [
                { value: 335, name: "小汽车" },
                { value: 310, name: "货车" }
              ]
            }
          ]
        },
        value: [
          {
            id: "01",
            txt: "1、 G10 XX路段",
            url: ""
          },
          {
            id: "02",
            txt: "2、 G10 XX路段",
            url: ""
          },
          {
            id: "03",
            txt: "3、 G10 XX路段",
            url: ""
          }
        ]
      },
      data_w: {
        t1: {
          value: 120,
          n1: "10",
          n2: "90"
        },
        t2: {
          txt: "交通量前三",
          color: "red"
        },
        t3: {
          txt: "货车前三",
          color: "red"
        },
        t4: {
          txt: "速度后三",
          color: "red"
        },
        orgOptions: {
          title: {
            text: "交通总流量",
            x: "center"
          },
          legend: {
            orient: "vertical",
            x: "left",
            data: ["小汽车", "货车"]
          },
          series: [
            {
              name: "交通总流量",
              type: "pie",
              radius: "55%",
              center: ["50%", "60%"],
              data: [
                { value: 335, name: "小汽车" },
                { value: 310, name: "货车" }
              ]
            }
          ]
        },
        value: [
          {
            id: "01",
            txt: "1、 G10 XX路段",
            url: ""
          },
          {
            id: "02",
            txt: "2、 G10 XX路段",
            url: ""
          },
          {
            id: "03",
            txt: "3、 G10 XX路段",
            url: ""
          }
        ]
      },
      data_m: {
        t1: {
          value: 1209,
          n1: "10",
          n2: "90"
        },
        t2: {
          txt: "交通量前三",
          color: "red"
        },
        t3: {
          txt: "货车前三",
          color: "red"
        },
        t4: {
          txt: "速度后三",
          color: "red"
        },
        orgOptions: {
          title: {
            text: "交通总流量",
            x: "center"
          },
          legend: {
            orient: "vertical",
            x: "left",
            data: ["小汽车", "货车"]
          },
          series: [
            {
              name: "交通总流量",
              type: "pie",
              radius: "55%",
              center: ["50%", "60%"],
              data: [
                { value: 335, name: "小汽车" },
                { value: 310, name: "货车" }
              ]
            }
          ]
        },
        value: [
          {
            id: "01",
            txt: "1、 G20 XX路段",
            url: ""
          },
          {
            id: "02",
            txt: "2、 G10 XX路段",
            url: ""
          },
          {
            id: "03",
            txt: "3、 G10 XX路段",
            url: ""
          }
        ]
      },
      orgOptions: {},
      cur: 0
    };
  },
  mounted() {
    this.data = this.data_w;
  },
  watch: {
    cur(value) {
      // 周
      if (value == 0) {
        this.data = this.data_w;
      } else {
        this.data = this.data_m;
      }
    }
  },
  components: {
    "v-chart": ECharts
  }
};
</script>
<style scoped>
.bottomContainer {
  width: 90%;
  height: 170px;
  position: relative;
  background-color: rgba(255, 255, 255, 0.8);
  margin: 0 auto;
  bottom: 170px;
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
  width: 25%;
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
  display: flex;
  float: left;
  width: 100%;
}
.tab-content div {
  flex: 1;
  text-align: center;
}
.info {
  border: 1px solid #bdb6b6;
  width: 25%;
}
.title1::after {
  content: "";
  width: 30px;
  height: 18px;
  background-color: blue;
  position: absolute;
  margin-left: 3px;
}
.title2::after {
  content: "";
  width: 30px;
  height: 18px;
  background-color: yellow;
  position: absolute;
  margin-left: 3px;
}
.title3::after {
  content: "";
  width: 30px;
  height: 18px;
  background-color: red;
  position: absolute;
  margin-left: 3px;
}
.chart1 {
  width: 100%;
  height:  100%;
}
.all-count {
  color: red;
}
</style>

