<template>
  <div id="app">
    <BaseMap/>
    <BottomInfo/>
    <RightInfo/>
  </div>
</template>

<script>
import BaseMap from "./components/BaseMap.vue";
import BottomInfo from "./components/BottomInfo";
import RightInfo from "./components/RightInfo";
export default {
  name: "app",
  components: {
    BaseMap,
    BottomInfo,
    RightInfo
  }
};
</script>

<style>
html,
body {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
 
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}
</style>
