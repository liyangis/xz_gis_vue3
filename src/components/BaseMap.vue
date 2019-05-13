<template>
  <div class="mapContainer" id="mapDiv"></div>
</template>
<script>
import MapService from "../modules/map-service.js";

export default {
  name: "BaseMap",
  data() {
    return {
      map: null
    };
  },
  mounted() {
    if (!this._mapService) {
      this._mapService = new MapService();
    }
    const _options = {};
    const self = this;
    this.mapAPI = this._mapService.mapAPI;
    this.mapAPI.then(api => {
      self.map = self._mapService.createMap(api, "mapDiv", _options);
    });
  },
  components: {
  
  }
};
</script>
<style scoped>
@import url("https://js.arcgis.com/3.24/esri/css/esri.css");
.mapContainer {
  width: 100%;
  height: calc(100% - 0px);
  margin: 0;
  padding: 0;
}
</style>


