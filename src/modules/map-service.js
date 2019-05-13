import { loadModules } from 'esri-loader';
//import config from 'data/config.json';

export default class MapService {
    constructor() {
        this.serverUrl = '';//config.arcgisAPI;
        this.mapAPI = this.initGISAPI(this.serverUrl);
    }
    // load a web map and return respons
    initGISAPI(serverUrl) {
        // loadModules(['esri/map'], options)
        //     .then(([Map]) => {
        //         // create map with the given options at a DOM node w/ id 'mapNode'
        //         let map = new Map('mapNode', {
        //             center: [-118, 34.5],
        //             zoom: 8,
        //             basemap: 'dark-gray'
        //         });
        //     })
        //     .catch(err => {
        //         // handle any script or module loading errors
        //         console.error(err);
        //     });
        const options = { url:'https://js.arcgis.com/3.24/' };
        return loadModules(['esri/map',"esri/layers/ArcGISTiledMapServiceLayer", 'esri/graphicsUtils', 'esri/layers/GraphicsLayer', 'esri/graphic',
            'esri/geometry/Point', 'esri/geometry/Extent', 'esri/geometry/Polygon', 'esri/geometry/Polyline',
            'esri/SpatialReference', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleFillSymbol',
            'esri/symbols/PictureMarkerSymbol', 'esri/symbols/TextSymbol'], options);

    }
    // load a web map and return respons
    createMap([Map, ArcGISTiledMapServiceLayer,graphicsUtils, GraphicsLayer, Graphic, Point, Extent, Polygon, Polyline,
        SpatialReference, SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol, TextSymbol],
        domNodeOrId, opts) {
        const sr = new SpatialReference({ wkid: 4326 });
        const fullExt = new Extent({
            xmin: 114.846495, ymin: 29.416361, xmax: 119.688903, ymax: 34.626925,
            spatialReference: { wkid: 4326 }
        });
        const mapOpts = {
            logo: false, slider: false, extent: fullExt.expand(1.1), fitExtent: true
                       
        };
        // 转换后的的CountyJSONconvert GeoJSON to ArcGIS JSON mapLevel:0=city 1=county
        const map = {
            opts: null, baseMap: null, cityLayer: null, cityLabelLayer: null,
            countyLayer: null, countyLabelLayer: null, cityBarChartLayer: null,
            highlightLayer: null, mapLevel: 0, currentCityName: '', countyJSON: null, jsonf: null,
            cityClickHelper: { timer: 0, delay: 200, prevent: false },
            addTiledMapServiceLayer:addTiledMapServiceLayer,
            zoomToGraphics: zoomToGraphics,
            addGraphic: addGraphic, addBarChart: addBarChart,
            addGraphicFromFeature: addGraphicFromFeature,
            createGeometry: createGeometry,
            getFillSymbol: getFillSymbol,
            getFillSymbolJSON: getFillSymbolJSON,
            addLayerLabel: addLayerLabel,
            addGraphicsLayer: addGraphicsLayer
        };
        
        const baseMap = new Map(domNodeOrId, mapOpts);
        addTiledMapServiceLayer(null,baseMap)
        map.baseMap = baseMap;
        map.jsonf = geoJsonConverter();
        map.opts = opts;
        return map;
        function addTiledMapServiceLayer(url,mapObj){
            var myServiceURL =url?url: "http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer";
            var layer = new ArcGISTiledMapServiceLayer(myServiceURL);
            return mapObj.addLayer(layer);
        }
        // common function,add graphicslayer
        function addGraphicsLayer(id, mapObj, layerOpts = null) {
            const layer = new GraphicsLayer(layerOpts ? layerOpts : null);
            layer.id = id;
            return mapObj.addLayer(layer);
        }
        // 添加柱状图 add chart(drawLayer,barData,mapGeometryJSON,baseMap)
        function addBarChart(layer, barData, features, mapObj) {
            layer.clear();
            const textJson = {
                'type': 'esriTS', 'color': [232, 134, 27],
                'font': {
                    'family': 'Microsoft Yahei', 'size': '1.125rem'
                }
            };
            textJson.xoffset = (-32 * 0.5);
            const ndata = (barData.value && barData.value.length > 0) ?
                orderBy(barData.value, ['value'], ['asc']) : null;
            const ds = ndata ? ((ndata[ndata.length - 1].value - ndata[0].value) / 5) : -1;
            features.forEach(element => {
                const pts = element.geometry.coordinates;
                const pt = new Point(pts[0], pts[1], sr);
                pt.setSpatialReference(sr);
                const gra = new Graphic();
                gra.setGeometry(pt);
                const index = findIndex(ndata, (t) => t.name === element.properties.NAME);
                let i = 1;
                if (index !== -1) {
                    if (ds !== -1) {
                        for (i = 1; i <= 5; i++) {
                            if (ndata[index].value <= (ndata[0].value + ds * i)) {
                                break;
                            }
                        }
                    }
                }
                const sym = getPMSymbol(i, MapDatas.themeBarChart);
                gra.setSymbol(sym);
                gra.setAttributes(element.properties);
                layer.add(gra);
                let txt = '0.0';
                let zv = (ndata && ndata[index]) ? ndata[index].value : 0;
                if (zv !== 0) {
                    zv = zv.toString();
                    if (zv.indexOf('.') < 0) {
                        txt = zv;
                    } else {
                        txt = zv.substring(0, zv.indexOf('.') + 3);
                    }
                }
                // 根据符号确定y偏移量
                let r = 35;
                const offys = [37, 48, 50, 76, 100];
                r = offys[i - 1] * 0.5;
                textJson.yoffset = r;
                const txtSymbol = createSymbol('text', textJson);
                txtSymbol.setText(txt);
                const graLabel = new Graphic();
                graLabel.setGeometry(pt);
                const txtGraphic = addGraphic(gra.geometry, txtSymbol, gra.attributes);
                layer.add(txtGraphic);
            });
            return layer;
        }
        // add city label text and point(cityPtJSON,cityLableName,baseMap)
        function addLayerLabel(data, layer, mapObj) {
            // add text
            const textJson = {
                'type': 'esriTS', 'color': 'black', 'haloColor': 'white', 'haloSize': '1px',
                'font': { 'family': 'Microsoft Yahei', }
            };
            textJson.yoffset = (-15);
            const ptJson = {
                'color': [255, 255, 255], 'size': 3, 'xoffset': 0, 'yoffset': 0, 'type': 'esriSMS', 'style': 'esriSMSCircle',
                'outline': {
                    'color': [0, 0, 0, 0], 'width': 1, 'type': 'esriSLS', 'style': 'esriSLSSolid'
                }
            };
            data.forEach(element => {
                const pts = element.geometry.coordinates;
                const pt = new Point(pts[0], pts[1], sr);
                pt.setSpatialReference(sr);
                const gra = new Graphic();
                gra.setGeometry(pt);
                const sym = new SimpleMarkerSymbol(ptJson);
                gra.setSymbol(sym);
                gra.setAttributes(element.properties);
                layer.add(gra);
                const txt = element.properties.NAME;
                // txt = txt.replace('市', '');
                const txtSymbol = createSymbol('text', textJson);
                txtSymbol.setText(txt);
                const graLabel = new Graphic();
                graLabel.setGeometry(pt);
                const txtGraphic = addGraphic(gra.geometry, txtSymbol, gra.attributes);
                layer.add(txtGraphic);
            });
            return layer;
        }
        // 创建几何图形
        function createGeometry(type, data) {
            let geo;
            switch (type) {
                case 'point':
                    geo = new Point(data);
                    break;
                case 'polyline':
                    geo = new Polyline(data);
                    break;
                case 'polygon':
                    geo = new Polygon(data);
                    break;
                default:
                    break;
            }
            geo.setSpatialReference(sr);
            return geo;
        }
        function createSymbol(type, data) {
            let geo;
            switch (type) {
                case 'text':
                    geo = new TextSymbol(data);
                    break;
                case 'Polyline':
                    geo = new Polyline(data);
                    break;
                case 'Polygon':
                    geo = new Polygon(data);
                    break;
                default:
                    break;
            }
            return geo;
        }
        function addGraphic(geometry, sym, attr) {
            const g = new Graphic(geometry);
            g.setSymbol(sym);
            g.setAttributes(attr);
            return g;
        }
        function addGraphicFromFeature(feature) {
            return new Graphic(feature);
        }
        function getPMSymbol(type, rules) {
            let result;
            rules.rule.forEach(element => {
                const item = element;
                if (type === item.equal) {
                    result = rules[item.style];
                    return result;
                }
            });
            return new PictureMarkerSymbol(result);
        }
        // 根据数据填充颜色
        function getFillSymbol(type, rules) {
            const result = getFillSymbolJSON(type, rules);
            return new SimpleFillSymbol(result);
        }
        // 根据数据填充颜色JSON
        function getFillSymbolJSON(type, rules) {
            let result =
                rules.rule.find(element => {
                    const item = element;
                    if (type === item.equal) {
                        return true;
                    }
                });
            result = rules[result.style];
            return result;
        }
        function zoomToGraphics(mapObj, glayer, zoom) {
            const gs = glayer.graphics;
            if (gs.length === 0) {
                return;
            }
            const graphicsExtent = graphicsUtils.graphicsExtent(gs);
            if (zoom) {
                if (graphicsExtent) {
                    const deferred = mapObj.setExtent(graphicsExtent.expand(1.1), true);
                }
            }
            return graphicsExtent;
        }
        // =================GeoJSON TO ESRIJSON======================================
        function geoJsonConverter() {
            const gCon = {};
            /*compares a GeoJSON geometry type and ESRI geometry type to see if they can be safely
             put together in a single ESRI feature. ESRI features must only have one
             geometry type, point, line, polygon*/
            function isCompatible(esriGeomType, gcGeomType) {
                let compatible = false;
                if ((esriGeomType === 'esriGeometryPoint' || esriGeomType === 'esriGeometryMultipoint')
                    && (gcGeomType === 'Point' || gcGeomType === 'MultiPoint')) {
                    compatible = true;
                } else if (esriGeomType === 'esriGeometryPolyline' &&
                    (gcGeomType === 'LineString' || gcGeomType === 'MultiLineString')) {
                    compatible = true;
                } else if (esriGeomType === 'esriGeometryPolygon' &&
                    (gcGeomType === 'Polygon' || gcGeomType === 'MultiPolygon')) {
                    compatible = true;
                }
                return compatible;
            }

            /*Take a GeoJSON geometry type and make an object that has information about
             what the ESRI geometry should hold. Includes the ESRI geometry type and the name
             of the member that holds coordinate information*/
            function gcGeomTypeToEsriGeomInfo(gcType) {
                let esriType, geomHolderId;
                if (gcType === 'Point') {
                    esriType = 'esriGeometryPoint';
                } else if (gcType === 'MultiPoint') {
                    esriType = 'esriGeometryMultipoint';
                    geomHolderId = 'points';
                } else if (gcType === 'LineString' || gcType === 'MultiLineString') {
                    esriType = 'esriGeometryPolyline';
                    geomHolderId = 'paths';
                } else if (gcType === 'Polygon' || gcType === 'MultiPolygon') {
                    esriType = 'esriGeometryPolygon';
                    geomHolderId = 'rings';
                }
                return {
                    type: esriType,
                    geomHolder: geomHolderId
                };
            }

            // Convert GeoJSON polygon coordinates to ESRI polygon coordinates
            function gcPolygonCoordinatesToEsriPolygonCoordinates(gcCoords) {
                let i, len;
                const esriCoords = [];
                let ring;
                for (i = 0, len = gcCoords.length; i < len; i++) {
                    ring = gcCoords[i];
                    // Exclusive OR.
                    if ((i === 0) !== ringIsClockwise(ring)) {
                        ring = ring.reverse();
                    }
                    esriCoords.push(ring);
                }
                return esriCoords;
            }
            /*rings is Clockwise or not
            */
            function ringIsClockwise(ring) {
                let sum = 0;
                let i = 1;
                const len = ring.length;
                let prev, cur;
                while (i < len) {
                    prev = cur || ring[0];
                    cur = ring[i];
                    sum += ((cur[0] - prev[0]) * (cur[1] + prev[1]));
                    i++;
                }
                return sum > 0;
            }

            /*Wraps GeoJSON coordinates in an array if necessary so code can iterate
             through array of points, rings, or lines and add them to an ESRI geometry
             Input is a GeoJSON geometry object. A GeoJSON GeometryCollection is not a
             valid input */
            function gcCoordinatesToEsriCoordinates(gcGeom) {
                let i, len, esriCoords;
                if (gcGeom.type === 'MultiPoint' || gcGeom.type === 'MultiLineString') {
                    esriCoords = gcGeom.coordinates || [];
                } else if (gcGeom.type === 'Point' || gcGeom.type === 'LineString') {
                    esriCoords = gcGeom.coordinates ? [gcGeom.coordinates] : [];
                } else if (gcGeom.type === 'Polygon') {
                    esriCoords = [];
                    if (gcGeom.coordinates) {
                        esriCoords = gcPolygonCoordinatesToEsriPolygonCoordinates(gcGeom.coordinates);
                    }
                } else if (gcGeom.type === 'MultiPolygon') {
                    esriCoords = [];
                    if (gcGeom.coordinates) {
                        for (i = 0, len = gcGeom.coordinates.length; i < len; i++) {
                            const a = gcPolygonCoordinatesToEsriPolygonCoordinates(gcGeom.coordinates[i]);
                            esriCoords.push(a[0]);
                        }
                    }
                }
                return esriCoords;
            }
            function gcGeometryToEsriGeometry(gcGeom) {
                let esriGeometry,
                    esriGeomInfo,
                    gcGeometriesToConvert,
                    i,
                    g,
                    coords;

                // if geometry collection, get info about first geometry in collection
                if (gcGeom.type === 'GeometryCollection') {
                    const geomCompare = gcGeom.geometries[0];
                    gcGeometriesToConvert = [];
                    esriGeomInfo = gcGeomTypeToEsriGeomInfo(geomCompare.type);
                    // loop through collection and only add compatible geometries to the array
                    // of geometries that will be converted
                    for (i = 0; i < gcGeom.geometries.length; i++) {
                        if (isCompatible(esriGeomInfo.type, gcGeom.geometries[i].type)) {
                            gcGeometriesToConvert.push(gcGeom.geometries[i]);
                        }
                    }
                } else {
                    esriGeomInfo = gcGeomTypeToEsriGeomInfo(gcGeom.type);
                    gcGeometriesToConvert = [gcGeom];
                }
                // if a collection contained multiple points, change the ESRI geometry
                // type to MultiPoint
                if (esriGeomInfo.type === 'esriGeometryPoint' && gcGeometriesToConvert.length > 1) {
                    esriGeomInfo = gcGeomTypeToEsriGeomInfo('MultiPoint');
                }
                // make new empty ESRI geometry object
                esriGeometry = {
                    // type: esriGeomInfo.type,
                    spatialReference: {
                        wkid: 4326
                    }
                };

                // perform conversion
                if (esriGeomInfo.type === 'esriGeometryPoint') {
                    if (!gcGeometriesToConvert[0] || !gcGeometriesToConvert[0].coordinates ||
                        gcGeometriesToConvert[0].coordinates.length === 0) {
                        esriGeometry.x = null;
                    } else {
                        esriGeometry.x = gcGeometriesToConvert[0].coordinates[0];
                        esriGeometry.y = gcGeometriesToConvert[0].coordinates[1];
                    }
                } else {
                    esriGeometry[esriGeomInfo.geomHolder] = [];
                    for (i = 0; i < gcGeometriesToConvert.length; i++) {
                        if (gcGeometriesToConvert.length > 1) {
                            coords = gcCoordinatesToEsriCoordinates(gcGeometriesToConvert[i]);
                            for (g = 0; g < coords.length; g++) {
                                esriGeometry[esriGeomInfo.geomHolder].push(coords[g]);
                            }

                        } else {
                            coords = gcCoordinatesToEsriCoordinates(gcGeometriesToConvert[i]);
                            for (g = 0; g < coords.length; g++) {
                                esriGeometry[esriGeomInfo.geomHolder].push(coords[g]);
                            }
                        }
                    }
                }
                return esriGeometry;
            }

            // Converts GeoJSON feature to ESRI REST Feature.
            //  Input parameter is a GeoJSON Feature object
            function gcFeatureToEsriFeature(gcFeature) {
                let esriFeat,
                    esriAttribs;
                if (gcFeature) {
                    esriFeat = {};
                    if (gcFeature.geometry) {
                        esriFeat.geometry = gcGeometryToEsriGeometry(gcFeature.geometry);
                    }
                    if (gcFeature.properties) {
                        esriAttribs = {};
                        for (const prop in gcFeature.properties) {
                            if (gcFeature.properties.hasOwnProperty(prop)) {
                                esriAttribs[prop] = gcFeature.properties[prop];
                            }
                        }
                        esriFeat.attributes = esriAttribs;
                    }
                }
                return esriFeat;
            }
            /*Converts GeoJSON FeatureCollection, Feature, or Geometry
             to ESRI Rest Featureset, Feature, or Geometry*/
            gCon.toEsri = function (geoJsonObject) {
                let outObj,
                    i,
                    gcFeats,
                    esriFeat;
                if (geoJsonObject) {
                    if (geoJsonObject.type === 'FeatureCollection') {
                        outObj = {
                            features: []
                        };
                        gcFeats = geoJsonObject.features;
                        for (i = 0; i < gcFeats.length; i++) {
                            esriFeat = gcFeatureToEsriFeature(gcFeats[i]);
                            if (esriFeat) {
                                outObj.features.push(esriFeat);
                            }
                        }
                    } else if (geoJsonObject.type === 'Feature') {
                        outObj = gcFeatureToEsriFeature(geoJsonObject);
                    } else {
                        outObj = gcGeometryToEsriGeometry(geoJsonObject);
                    }
                }
                return outObj;
            };
            return gCon;
        }
    }

}