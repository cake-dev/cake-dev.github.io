// create map object
// limit the map to the world (prevents errors when requesting weather data for areas outside the map coordinates)
var southWest = L.latLng(-90, -160);
var northEast = L.latLng(90, 160);
var bounds = L.latLngBounds(southWest, northEast);
var map = L.map('weather_map', { zoomControl: false }).setView([0, 0], 2).setMaxBounds(bounds).setMinZoom(2);

var api_key = "8f7c8250dda489ee29edf30dd09ee65b";

// Dropdown and modal functions
{

    function dropFunction() {
        var x = document.getElementById("myDIV");
        if (x.className.indexOf("w3-show") == -1) {
            x.className += " w3-show";
        } else {
            x.className = x.className.replace(" w3-show", "");
        }
    }

    function dropFunction2() {
        var x = document.getElementById("info");
        if (x.className.indexOf("w3-show") == -1) {
            x.className += " w3-show";
        } else {
            x.className = x.className.replace(" w3-show", "");
        }
    }

    function openCity(evt, cityName) {
        var i, x, tablinks;
        x = document.getElementsByClassName("city");
        for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablink");
        for (i = 0; i < x.length; i++) {
            tablinks[i].classList.remove("w3-light-grey");
        }
        document.getElementById(cityName).style.display = "block";
        evt.currentTarget.classList.add("w3-light-grey");
    }

    function openModal() {
        document.getElementById('id01').style.display = 'block'
    }

    function closeModal() {
        document.getElementById('id01').style.display = 'none'
    }
}

// data helper functions
{
    function kelvinToFahrenheit(kelvin) {
        return (kelvin - 273.15) * 9 / 5 + 32;
    }

    function epochToDate(epoch) {
        var date = new Date(epoch * 1000);
        return date.toDateString();
    }

    function epochToTime(epoch) {
        var date = new Date(epoch * 1000);
        return date.toLocaleTimeString();
    }

    function geolocateCity(city, country = "US") {
        var coords = {};
        var country = this.country;
        // var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&appid=" + api_key;
        var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + api_key;
        $.getJSON(url, function (data) {
            coords.lat = data.coord.lat;;
            coords.lon = data.coord.lon;
        });
        return coords;
    }

    function getCityName(lat, lon) {
        var url = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + api_key;
        $.getJSON(url, function (data) {
            var city = data.name;
            return city;
        });
    }

    function getCurrentLocation() {
        var coords = {};
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                coords.lat = position.coords.latitude;
                coords.lon = position.coords.longitude;
            });
        }
        if (coords.lat == undefined || coords.lon == undefined) {
            setTimeout(getCurrentLocation, 1000)
        }
        return coords;
    }

    function windDirectionFromDegrees(winddirection) {
        var winddirectionstring = ""; // Wind from direction x as text
        if (winddirection > 348.75 && winddirection <= 11.25) {
            winddirectionstring = "North";
        } else if (winddirection > 11.25 && winddirection <= 33.75) {
            winddirectionstring = "Northnortheast";
        } else if (winddirection > 33.75 && winddirection <= 56.25) {
            winddirectionstring = "Northeast";
        } else if (winddirection > 56.25 && winddirection <= 78.75) {
            winddirectionstring = "Eastnortheast";
        } else if (winddirection > 78.75 && winddirection <= 101.25) {
            winddirectionstring = "East";
        } else if (winddirection > 101.25 && winddirection <= 123.75) {
            winddirectionstring = "Eastsoutheast";
        } else if (winddirection > 123.75 && winddirection <= 146.25) {
            winddirectionstring = "Southeast";
        } else if (winddirection > 146.25 && winddirection <= 168.75) {
            winddirectionstring = "Southsoutheast";
        } else if (winddirection > 168.75 && winddirection <= 191.25) {
            winddirectionstring = "South";
        } else if (winddirection > 191.25 && winddirection <= 213.75) {
            winddirectionstring = "Southsouthwest";
        } else if (winddirection > 213.75 && winddirection <= 236.25) {
            winddirectionstring = "Southwest";
        } else if (winddirection > 236.25 && winddirection <= 258.75) {
            winddirectionstring = "Westsouthwest";
        } else if (winddirection > 258.75 && winddirection <= 281.25) {
            winddirectionstring = "West";
        } else if (winddirection > 281.25 && winddirection <= 303.75) {
            winddirectionstring = "Westnorthwest";
        } else if (winddirection > 303.75 && winddirection <= 326.25) {
            winddirectionstring = "Northwest";
        } else if (winddirection > 326.25 && winddirection <= 348.75) {
            winddirectionstring = "Northnorthwest";
        } else {
            winddirectionstring = " - currently no winddata available - ";
        };
        return winddirectionstring;
    }
}


// CURRENT WEATHER DATA TABLE functions
{
    function fetchWeatherDataAndMakeTable(city_name = "Missoula", coords = null) {
        // create table
        var city = city_name;
        var country = "US";
        var url = "";
        // url for lat long weather
        if (coords != null) {
            url = "https://api.openweathermap.org/data/2.5/weather?lat=" + coords.lat + "&lon=" + coords.lon + "&appid=" + api_key;
        } else {
            url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + api_key;
        }
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // string version of a table using all the data and table tags, creating a vertical table with minimal width
                var table_string = "<table class='w3-table w3-striped w3-border w3-border-black w3-small w3-left w3-hoverable' style='width: 100%;'>";
                table_string += "<tr><th>City</th><td>" + data.name + "</td></tr>";
                table_string += "<tr><th>Date</th><td>" + epochToDate(data.dt) + "</td></tr>";
                table_string += "<tr><th>Temperature</th><td>" + data.main.temp + " F</td></tr>";
                table_string += "<tr><th>Feels Like</th><td>" + data.main.feels_like + " F</td></tr>";
                table_string += "<tr><th>Humidity</th><td>" + data.main.humidity + "%</td></tr>";
                table_string += "<tr><th>Wind Speed</th><td>" + data.wind.speed + " mph</td></tr>";
                table_string += "<tr><th>Wind Direction</th><td>" + data.wind.deg + " degrees <br>(from: " + windDirectionFromDegrees(data.wind.deg) + ")</td></tr>";
                table_string += "<tr><th>Cloud Cover</th><td>" + data.clouds.all + "%</td></tr>";
                table_string += "<tr><th>Pressure</th><td>" + data.main.pressure + " hPa</td></tr>";
                table_string += "<tr><th>Sunrise</th><td>" + epochToTime(data.sys.sunrise) + "</td></tr>";
                table_string += "<tr><th>Sunset</th><td>" + epochToTime(data.sys.sunset) + "</td></tr>";
                table_string += "</table>";
                // set the innerHTML of the table div to the table string
                // var table_string = "<table id='weather_table' class='table table-sm'><thead class='thead-dark'><tr><th scope='col'>Weather Data</th></tr></thead><tr><th>City: </th><td>" + data.name + "</td></tr><tr><th>Country: </th><td>" + data.sys.country + "</td></tr><tr><th>Date: </th><td>" + epochToDate(data.dt) + "</td></tr><tr><th>Temperature: </th><td>" + data.main.temp.toFixed(1) + "°F</td></tr><tr><th>Weather: </th><td>" + data.weather[0].main + "</td></tr><tr><th>Humidity: </th><td>" + data.main.humidity + "%</td></tr><tr><th>Wind Speed/Direction: </th><td>" + data.wind.speed + "mph/" + data.wind.deg + "°</td></tr><tr><th>Cloud Coverage: </th><td>" + data.clouds.all + "%</td></tr><tr><th>Sunrise: </th><td>" + epochToTime(data.sys.sunrise) + "</td></tr><tr><th>Sunset: </th><td>" + epochToTime(data.sys.sunset) + "</td></tr></table>";
                d3.select("#weather_data_table").html(table_string);
            })
    }

}
fetchWeatherDataAndMakeTable();

// CURRENT WEATHER MAP functions
{
    function fetchWeatherMapAndDisplay(city_name = "Missoula") {
        var city = city_name;
        var country = "US";
        var city_coords = geolocateCity(city);
        var current_coords = getCurrentLocation();


        var clouds = L.OWM.clouds({ opacity: 0.8, appId: api_key, noWrap: true });
        var cloudscls = L.OWM.cloudsClassic({ opacity: 0.5, appId: api_key, noWrap: true });
        var precipitation = L.OWM.precipitation({ opacity: 0.5, appId: api_key, noWrap: true });
        var precipitationcls = L.OWM.precipitationClassic({ opacity: 0.5, appId: api_key, noWrap: true });
        var rain = L.OWM.rain({ opacity: 0.5, appId: api_key, noWrap: true });
        var raincls = L.OWM.rainClassic({ opacity: 0.5, appId: api_key, noWrap: true });
        var snow = L.OWM.snow({ opacity: 0.5, appId: api_key, noWrap: true });
        var pressure = L.OWM.pressure({ opacity: 0.4, appId: api_key, noWrap: true });
        var temp = L.OWM.temperature({ opacity: 0.5, appId: api_key, noWrap: true });
        var wind = L.OWM.wind({ opacity: 0.5, appId: api_key, noWrap: true });

        // var current_city = L.OWM.current({
        //     intervall: 15, minZoom: 5,
        //     appId: api_key
        // });

        var overlayMaps = {};
        overlayMaps['Clouds'] = cloudscls;
        overlayMaps['Precipitation'] = precipitationcls;
        overlayMaps['Rain'] = raincls;
        overlayMaps['Snow'] = snow;
        overlayMaps['Temperature'] = temp;
        overlayMaps['Wind Speed'] = wind;
        overlayMaps['Air Pressure'] = pressure;

        var basemap_tiles = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
        var stamen_terrain_tiles = "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png";
        // var basemap_tiles = ""
        var Stamen_Toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png',
            noWrap: true
        });

        var basemap_layers = {
            "Stamen Toner": Stamen_Toner,
            "Stamen Terrain": L.tileLayer(stamen_terrain_tiles, { noWrap: true }),
            "ESRI World Street Map": L.tileLayer(basemap_tiles, { noWrap: true }),
        }



        // add bounds to map


        setMapView(current_coords);

        // create basemap layer group
        var basemap_group = L.layerGroup([basemap_layers["Stamen Toner"]]);
        // add to map
        basemap_group.addTo(map);


        L.Control.Layers.include({
            getOverlays: function () {
                // create hash to hold all layers
                var control, layers;
                layers = {};
                control = this;

                // loop thru all layers in control
                control._layers.forEach(function (obj) {
                    var layerName;

                    // check if layer is an overlay
                    if (obj.overlay) {
                        // get name of overlay
                        layerName = obj.name;
                        // store whether it's present on the map or not
                        return layers[layerName] = control._map.hasLayer(obj.layer);
                    }
                });

                return layers;
            }
        });

        // add layer controls
        var controls = L.control.layers(basemap_layers, overlayMaps)//.addTo(map);
        controls.addTo(map);

        // show selected layer names on map
        map.on('overlayadd', function (eventLayer) {
            var layerName = eventLayer.name;
            var layer = eventLayer.layer;
            var active_l = controls.getOverlays();
            var active_layers = Object.keys(active_l).filter(function (key) { return active_l[key] });
            setTextBoxLayerName(active_layers);
        });
        map.on('overlayremove', function (eventLayer) {
            var layerName = eventLayer.name;
            var layer = eventLayer.layer;
            var active_l = controls.getOverlays();
            var active_layers = Object.keys(active_l).filter(function (key) { return active_l[key] });
            setTextBoxLayerName(active_layers);
        });

        // set initial layer to temp
        temp.addTo(map);
    }

    function setTextBoxLayerName(selected_layers) {
        // check if textbox already exists and remove if so
        if (d3.select("#info_text").empty() == false) {
            d3.select("#info_text").remove();
        }
        L.Control.textbox = L.Control.extend({
            onAdd: function (map) {
                var text = L.DomUtil.create('div');
                text.id = "info_text";
                // loop thru all layers in control
                var layer_names_string = "";
                for (var i = 0; i < selected_layers.length; i++) {
                    layer_names_string += selected_layers[i] + ", ";
                }
                text.innerHTML = "<strong>" + layer_names_string + "</strong>"
                return text;
            },

            onRemove: function (map) {
                // Nothing to do here
            }
        });
        L.control.textbox = function (opts) { return new L.Control.textbox(opts); }
        L.control.textbox({ position: 'bottomleft' }).addTo(map);
    }

    function setMapView(coords) {
        // wait until coords are defined and then set the map view
        setTimeout(function () {
            map.setView([coords.lat, coords.lon], 11);
        }, 1000);
    }
}
fetchWeatherMapAndDisplay();

// 5 day 3 hr WEATHER FORECAST functions
{

    // the current forecast data
    var forecast_data = null;

    // dict mapping the slider value to the time string
    var slider_dict = {
        0: "2:00AM",
        1: "5:00AM",
        2: "8:00AM",
        3: "11:00AM",
        4: "2:00PM",
        5: "5:00PM",
        6: "8:00PM",
        7: "11:00PM"
    }

    var slider = d3.select("#time_slider");
    slider.attr("min", 0);
    slider.attr("max", 7);
    slider.attr("value", 0);
    slider.attr("step", 1);
    // set slider default value to 3
    slider.property("value", 3);

    var slider_vals = d3.select("#slider_ticks");
    for (var i = 0; i <= 7; i++) {
        slider_vals.append("span")
            .attr("class", "tick")
            .text(slider_dict[i]);
    }

    function fetchWeatherForecastAndDisplayTable(city_name = "Missoula", coords = null, day = "none") {
        var city = city_name;
        var country = "US";
        var city_coords = geolocateCity(city);

        // var owm_url = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + country + "&units=imperial&appid=" + api_key;
        var owm_url = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=" + api_key;

        d3.json(owm_url)
            .then(function (data) {
                var forecast_data = data.list;
                var date_n1 = new Date(forecast_data[0].dt * 1000);
                var date_n1_string = date_n1.toLocaleDateString();
                var date_n2 = new Date(forecast_data[8].dt * 1000);
                var date_n2_string = date_n2.toLocaleDateString();
                var date_n3 = new Date(forecast_data[16].dt * 1000);
                var date_n3_string = date_n3.toLocaleDateString();
                var date_n4 = new Date(forecast_data[24].dt * 1000);
                var date_n4_string = date_n4.toLocaleDateString();
                var date_n5 = new Date(forecast_data[32].dt * 1000);
                var date_n5_string = date_n5.toLocaleDateString();

                var date_strings = [date_n2_string, date_n3_string, date_n4_string, date_n5_string];

                var daily_data = {}

                // loop through the data and create a dictionary of daily data, organized by date
                forecast_data.forEach(function (forecast) {
                    var forecast_time = new Date(forecast.dt * 1000);
                    var forecast_date = forecast_time.toLocaleDateString();
                    // if the date is not in date strings, skip it
                    if (date_strings.includes(forecast_date) == true) {
                        if (daily_data[forecast_date] == undefined) {
                            daily_data[forecast_date] = [];
                        }
                        var fixed_forecast = formatForecast(forecast);
                        daily_data[forecast_date].push(fixed_forecast);
                    }
                })

                // // extract average values over each day
                // var daily_data_avg = {};
                // Object.keys(daily_data).forEach(function (date) {
                //     var daily_data_date = daily_data[date];
                //     var daily_data_date_avg = {};
                //     daily_data_date_avg["temp"] = d3.mean(daily_data_date, function (d) { return d.temp; });
                //     daily_data_date_avg["humidity"] = d3.mean(daily_data_date, function (d) { return d.humidity; });
                //     daily_data_date_avg["pressure"] = d3.mean(daily_data_date, function (d) { return d.pressure; });
                //     daily_data_date_avg["wind"] = d3.mean(daily_data_date, function (d) { return d.wind; });
                //     daily_data_date_avg["clouds"] = d3.mean(daily_data_date, function (d) { return d.clouds; });
                //     daily_data_avg[date] = daily_data_date_avg;
                // });

                var selected_day = date_n2_string;

                if (day != "none") {
                    selected_day = day
                } else {
                    selected_day = date_n2_string;
                }

                setCurrentForecastData(daily_data);
                displayForecastTable(daily_data, date_strings);
                displayForecastChart(daily_data, selected_day);




                slider.on("input", function () {
                    var slider_value = d3.select(this).property("value");
                    displayForecastTable(daily_data, date_strings, slider_value);
                })

                // TODO create a chart / widget to display the forecast data
                // for the widget, reference the widgets from OWM

            })
    }

    // billboart.js chart for displaying the forecast data based on a specified weather parameter
    // TODO investigate why the chart is not displaying the data correctly (cuts off the last data point, weird data title) 
    function displayForecastChart(daily_data, day, weather_param = "temp") {
        // clear bb instance to prevent multiple charts from being displayed
        bb.instance = [];
        var chart_data = [];
        var chart_labels = [];
        var chart_colors = [];
        var chart_colors_dict = {
            "temp": "#ff0000",
            "humidity": "#0000ff",
            "pressure": "#00ff00",
            "wind": "#ffff00",
            "clouds": "#ff00ff",
            "weather_detail": "#00ffff"
        }
        var day_to_display = day;
        var day_data = daily_data[day_to_display];
        var weather_detail_data = [];
        var weather_detail_labels = [];
        day_data.forEach(function (d) {
            chart_data.push(d[weather_param]);
            chart_labels.push(d.time);
            chart_colors.push(chart_colors_dict[weather_param]);
        })
        day_data.forEach(function (d) {
            weather_detail_data.push(d.weather_detail);
            weather_detail_labels.push(d.time);
        })
        // add weather parameter to the front of the chart data array (for the data title)
        chart_data.unshift(weather_param);
        // clear the chart if it already exists
        d3.select("#forecast_chart").selectAll("*").remove();

        var chart = bb.generate({
            title: {
                text: weather_param + " for " + day
            },
            data: {
                columns: [
                    chart_data,
                ],
                type: "area",
                colors: {
                    data1: chart_colors_dict[weather_param]
                }
            },
            axis: {
                x: {
                    type: "category",
                    categories: chart_labels
                },
                x2: {
                    type: "category",
                    categories: weather_detail_labels
                },
                // add y axis and format symbol based on weather parameter
                y: {
                    tick: {
                        format: function (d) {
                            if (weather_param == "temp") {
                                return d + " °F";
                            } else if (weather_param == "humidity") {
                                return d + " %";
                            } else if (weather_param == "pressure") {
                                return d + " hPa";
                            } else if (weather_param == "wind") {
                                return d + " mph";
                            } else if (weather_param == "clouds") {
                                return d + " %";
                            }
                        }
                    }
                }

            },
            // add tooltip and format symbol based on weather parameter
            tooltip: {
                format: {
                    value: function (value, ratio, id) {
                        var format = d3.format(".1f");
                        if (weather_param == "temp") {
                            return format(value) + " °F";
                        } else if (weather_param == "humidity") {
                            return format(value) + " %";
                        } else if (weather_param == "pressure") {
                            return format(value) + " hPa";
                        } else if (weather_param == "wind") {
                            return format(value) + " mph";
                        } else if (weather_param == "clouds") {
                            return format(value) + " %";
                        } else if (weather_param == "weather") {
                            return format(value);
                        }
                    }
                }
            },
            background: {
                color: "white"
            },
            grid: {
                y: {
                    show: true
                }
            },
            bindto: "#forecast_chart"

        });

        // add controls to the chart to change the weather parameter
        var chart_controls = d3.select("#forecast_chart_controls");
        chart_controls.selectAll("*").remove();
        chart_controls.append("button")
            .attr("class", "btn btn-primary")
            .attr("value", "temp")
            .text("Temperature")
        chart_controls.append("button")
            .attr("class", "btn btn-primary")
            .attr("value", "wind")
            .text("Wind")
        chart_controls.append("button")
            .attr("class", "btn btn-primary")
            .attr("value", "humidity")
            .text("Humidity")
        chart_controls.append("button")
            .attr("class", "btn btn-primary")
            .attr("value", "clouds")
            .text("Clouds")

        chart_controls.selectAll("button").on("click", function () {
            var weather_param = d3.select(this).attr("value");
            displayForecastChart(daily_data, day_to_display, weather_param);
        })
    }


    // TODO get this function to change the forecast chart based on the selected weather parameter
    function selectWeatherParamater(value = "temp", day = "none") {
        // get weather param as lowercase
        var weather_param = value.toLowerCase();
        var current_forecast_data = getCurrentForecastData();
        var the_day = Object.keys(current_forecast_data)[0];
        if (day != "none") {
            var the_day = day;
        }
        displayForecastChart(current_forecast_data, the_day, weather_param);
    }

    function selectWeatherForecastDay(day) {
        var current_forecast_data = getCurrentForecastData();
        displayForecastChart(current_forecast_data, day);
    }

    function displayForecastTable(f_data, f_dates, time = 3) {
        var forecast_data_table = d3.select("#weather_forecast_table");
        // clear table before adding new data
        forecast_data_table.html("");
        var table_string = "<div class='table100 ver4 m-b-110'><table data-vertable='ver4'>";
        table_string += "<thead><tr class='row100 head'><th class='column100 column1' data-column='column1'>4 Day Forecast - " + slider_dict[time] + "</th><th class='column100 date-header column2' data-column='column2' onclick='selectWeatherForecastDay(this.innerText)'>" + f_dates[0] + "</th><th class='column100 date-header column3' data-column='column3' onclick='selectWeatherForecastDay(this.innerText)'>" + f_dates[1] + "</th><th class='column100 date-header column4' data-column='column4' onclick='selectWeatherForecastDay(this.innerText)'>" + f_dates[2] + "</th><th class='column100 date-header column5' data-column='column5' onclick='selectWeatherForecastDay(this.innerText)'>" + f_dates[3] + "</th></tr></thead>";
        table_string += "<tbody>";
        table_string += "<tr class='row100'><td class='column100 column1' data-column='column1'>Weather</td>";
        table_string += "<td class='column100 column2' data-column='column2'>" + f_data[f_dates[0]][time].weather_detail + "</td>";
        table_string += "<td class='column100 column3' data-column='column3'>" + f_data[f_dates[1]][time].weather_detail + "</td>";
        table_string += "<td class='column100 column4' data-column='column4'>" + f_data[f_dates[2]][time].weather_detail + "</td>";
        table_string += "<td class='column100 column5' data-column='column5'>" + f_data[f_dates[3]][time].weather_detail + "</td>";
        // table_string += "<td class='column100 column6' data-column='column6'>" + f_data[f_dates[4]][time].weather + "</td>";
        table_string += "</tr>";
        table_string += "<tr class='row100'><td class='column100 weather_row_name column1' data-column='column1' onclick='selectWeatherParamater(this.innerText)'>Temp</td>";
        table_string += "<td class='column100 column2' data-column='column2'>" + f_data[f_dates[0]][time].temp + "°F</td>";
        table_string += "<td class='column100 column3' data-column='column3'>" + f_data[f_dates[1]][time].temp + "°F</td>";
        table_string += "<td class='column100 column4' data-column='column4'>" + f_data[f_dates[2]][time].temp + "°F</td>";
        table_string += "<td class='column100 column5' data-column='column5'>" + f_data[f_dates[3]][time].temp + "°F</td>";
        // table_string += "<td class='column100 column6' data-column='column6'>" + f_data[f_dates[4]][time].temp + "°F</td>";
        table_string += "</tr>";
        table_string += "<tr class='row100'><td class='column100 weather_row_name column1' data-column='column1' onclick='selectWeatherParamater(this.innerText)'>Humidity</td>";
        table_string += "<td class='column100 column2' data-column='column2'>" + f_data[f_dates[0]][time].humidity + "%</td>";
        table_string += "<td class='column100 column3' data-column='column3'>" + f_data[f_dates[1]][time].humidity + "%</td>";
        table_string += "<td class='column100 column4' data-column='column4'>" + f_data[f_dates[2]][time].humidity + "%</td>";
        table_string += "<td class='column100 column5' data-column='column5'>" + f_data[f_dates[3]][time].humidity + "%</td>";
        // table_string += "<td class='column100 column6' data-column='column6'>" + f_data[f_dates[4]][time].humidity + "%</td>";
        table_string += "</tr>";
        table_string += "<tr class='row100'><td class='column100 weather_row_name column1' data-column='column1' onclick='selectWeatherParamater(this.innerText)'>Pressure</td>";
        table_string += "<td class='column100 column2' data-column='column2'>" + f_data[f_dates[0]][time].pressure + "hPa</td>";
        table_string += "<td class='column100 column3' data-column='column3'>" + f_data[f_dates[1]][time].pressure + "hPa</td>";
        table_string += "<td class='column100 column4' data-column='column4'>" + f_data[f_dates[2]][time].pressure + "hPa</td>";
        table_string += "<td class='column100 column5' data-column='column5'>" + f_data[f_dates[3]][time].pressure + "hPa</td>";
        // table_string += "<td class='column100 column6' data-column='column6'>" + f_data[f_dates[4]][time].pressure + "hPa</td>";
        table_string += "</tr>";
        table_string += "<tr class='row100'><td class='column100 weather_row_name column1' data-column='column1' onclick='selectWeatherParamater(this.innerText)'>Wind</td>";
        table_string += "<td class='column100 column2' data-column='column2'>" + f_data[f_dates[0]][time].wind + "mph</td>";
        table_string += "<td class='column100 column3' data-column='column3'>" + f_data[f_dates[1]][time].wind + "mph</td>";
        table_string += "<td class='column100 column4' data-column='column4'>" + f_data[f_dates[2]][time].wind + "mph</td>";
        table_string += "<td class='column100 column5' data-column='column5'>" + f_data[f_dates[3]][time].wind + "mph</td>";
        // table_string += "<td class='column100 column6' data-column='column6'>" + f_data[f_dates[4]][time].wind + "mph</td>";
        table_string += "</tr>";
        table_string += "<tr class='row100'><td class='column100 weather_row_name column1' data-column='column1' onclick='selectWeatherParamater(this.innerText)'>Clouds</td>";
        table_string += "<td class='column100 column2' data-column='column2'>" + f_data[f_dates[0]][time].clouds + "%</td>";
        table_string += "<td class='column100 column3' data-column='column3'>" + f_data[f_dates[1]][time].clouds + "%</td>";
        table_string += "<td class='column100 column4' data-column='column4'>" + f_data[f_dates[2]][time].clouds + "%</td>";
        table_string += "<td class='column100 column5' data-column='column5'>" + f_data[f_dates[3]][time].clouds + "%</td>";
        // table_string += "<td class='column100 column6' data-column='column6'>" + f_data[f_dates[4]][time].clouds + "%</td>";
        table_string += "</tr>";
        table_string += "</tbody>";
        table_string += "</table>";
        table_string += "</div>";
        // table_string += "<span id='ex18-label-1' class='sr-only'>Change Time</span>"

        forecast_data_table.html(table_string);
        // table hover functionality 
        $('.column100').on('mouseover', function () {
            var table1 = $(this).parent().parent().parent();
            var table2 = $(this).parent().parent();
            var verTable = $(table1).data('vertable') + "";
            var column = $(this).data('column') + "";
            $(table2).find("." + column).addClass('hov-column-' + verTable);
            $(table1).find(".row100.head ." + column).addClass('hov-column-head-' + verTable);
        });
        $('.column100').on('mouseout', function () {
            var table1 = $(this).parent().parent().parent();
            var table2 = $(this).parent().parent();
            var verTable = $(table1).data('vertable') + "";
            var column = $(this).data('column') + "";
            $(table2).find("." + column).removeClass('hov-column-' + verTable);
            $(table1).find(".row100.head ." + column).removeClass('hov-column-head-' + verTable);
        });
    }

    function formatForecast(forecast_d) {
        var forecast_time = new Date(forecast_d.dt * 1000);
        var forecast_time_string = forecast_time.toLocaleString();
        var forecast_temp = forecast_d.main.temp.toFixed(1);
        var forecast_humidity = forecast_d.main.humidity;
        var forecast_pressure = forecast_d.main.pressure;
        var forecast_wind = forecast_d.wind.speed;
        var forecast_clouds = forecast_d.clouds.all;
        var forecast_weather = forecast_d.weather[0].main;
        var forecast_date = forecast_time.toLocaleDateString();
        var forecast_weather_detail = forecast_d.weather[0].description

        return {
            time: forecast_time_string,
            temp: forecast_temp,
            humidity: forecast_humidity,
            pressure: forecast_pressure,
            wind: forecast_wind,
            clouds: forecast_clouds,
            weather: forecast_weather,
            weather_detail: forecast_weather_detail,
            date: forecast_date
        }
    }

    function setCurrentForecastData(data) {
        forecast_data = data;
    }

    function getCurrentForecastData() {
        return forecast_data;
    }

}
fetchWeatherForecastAndDisplayTable();

//WEATHER MAP POPUP function
var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString()) //esample from leaflet, will be immediately replaced by weatherpopup...
        .openOn(map);


    //getting json function
    $(document).ready(function () {
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?lat=" + e.latlng.lat + '&lon=' + e.latlng.lng + "&appid=" + api_key,
            dataType: 'json',
            success: function (data) {
                // storing json data in variables
                weatherlocation_lon = data.coord.lon; // lon WGS84
                weatherlocation_lat = data.coord.lat; // lat WGS84
                weatherstationname = data.name // Name of Weatherstation
                weatherstationid = data.id // ID of Weatherstation
                weathertime = data.dt // Time of weatherdata (UTC)
                temperature = data.main.temp; // Kelvin
                airpressure = data.main.pressure; // hPa
                airhumidity = data.main.humidity; // %
                temperature_min = data.main.temp_min; // Kelvin
                temperature_max = data.main.temp_max; // Kelvin
                windspeed = data.wind.speed; // Meter per second
                winddirection = data.wind.deg; // Wind from direction x degree from north
                cloudcoverage = data.clouds.all; // Cloudcoverage in %
                weatherconditionid = data.weather[0].id // ID
                weatherconditionstring = data.weather[0].main // Weatheartype
                weatherconditiondescription = data.weather[0].description // Weatherdescription
                weatherconditionicon = data.weather[0].icon // ID of weathericon

                // Converting Unix UTC Time
                var utctimecalc = new Date(weathertime * 1000);
                var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
                var year = utctimecalc.getFullYear();
                var month = months[utctimecalc.getMonth()];
                var date = utctimecalc.getDate();
                var hour = utctimecalc.getHours();
                var min = utctimecalc.getMinutes();
                var sec = utctimecalc.getSeconds();
                var time = date + '.' + month + '.' + year + ' ' + hour + ':' + min + ' Uhr';

                // recalculating
                var weathercondtioniconhtml = "http://openweathermap.org/img/w/" + weatherconditionicon + ".png";
                var weathertimenormal = time; // reallocate time var....
                var temperaturefahrenheit = kelvinToFahrenheit(temperature).toFixed(1)  // Converting Kelvin to Fahrenheit
                var windspeedknots = Math.round((windspeed * 1.94) * 100) / 100; // Windspeed from m/s in Knots; Round to 2 decimals
                var windspeedkmh = Math.round((windspeed * 3.6) * 100) / 100; // Windspeed from m/s in km/h; Round to 2 decimals
                var windspeedmph = Math.round((windspeed * 2.237) * 100) / 100; // Windspeed from m/s in mph; Round to 2 decimals
                var winddirectionstring = "Im the wind from direction"; // Wind from direction x as text
                if (winddirection > 348.75 && winddirection <= 11.25) {
                    winddirectionstring = "North";
                } else if (winddirection > 11.25 && winddirection <= 33.75) {
                    winddirectionstring = "Northnortheast";
                } else if (winddirection > 33.75 && winddirection <= 56.25) {
                    winddirectionstring = "Northeast";
                } else if (winddirection > 56.25 && winddirection <= 78.75) {
                    winddirectionstring = "Eastnortheast";
                } else if (winddirection > 78.75 && winddirection <= 101.25) {
                    winddirectionstring = "East";
                } else if (winddirection > 101.25 && winddirection <= 123.75) {
                    winddirectionstring = "Eastsoutheast";
                } else if (winddirection > 123.75 && winddirection <= 146.25) {
                    winddirectionstring = "Southeast";
                } else if (winddirection > 146.25 && winddirection <= 168.75) {
                    winddirectionstring = "Southsoutheast";
                } else if (winddirection > 168.75 && winddirection <= 191.25) {
                    winddirectionstring = "South";
                } else if (winddirection > 191.25 && winddirection <= 213.75) {
                    winddirectionstring = "Southsouthwest";
                } else if (winddirection > 213.75 && winddirection <= 236.25) {
                    winddirectionstring = "Southwest";
                } else if (winddirection > 236.25 && winddirection <= 258.75) {
                    winddirectionstring = "Westsouthwest";
                } else if (winddirection > 258.75 && winddirection <= 281.25) {
                    winddirectionstring = "West";
                } else if (winddirection > 281.25 && winddirection <= 303.75) {
                    winddirectionstring = "Westnorthwest";
                } else if (winddirection > 303.75 && winddirection <= 326.25) {
                    winddirectionstring = "Northwest";
                } else if (winddirection > 326.25 && winddirection <= 348.75) {
                    winddirectionstring = "Northnorthwest";
                } else {
                    winddirectionstring = " - currently no winddata available - ";
                };

                //Popup with content
                var fontsizesmall = 1;
                popup.setContent("Weatherdata:<br>" + "<img src=" + weathercondtioniconhtml + "><br>" + weatherconditionstring + " (Weather-ID: " + weatherconditionid + "): " + weatherconditiondescription + "<br><br>Temperature: " + temperaturefahrenheit + "°F<br>Airpressure: " + airpressure + " hPa<br>Humidity: " + airhumidity + "%" + "<br>Cloudcoverage: " + cloudcoverage + "%<br><br>Windspeed: " + windspeedmph + " mph<br>Wind from direction: " + winddirectionstring + " (" + winddirection + "°)" + "<br><br><font size=" + fontsizesmall + ">Source:<br>openweathermap.org<br>Measure time: " + weathertimenormal + "<br>Weatherstation: " + weatherstationname + "<br>Weatherstation Coordinates: " + weatherlocation_lon + ", " + weatherlocation_lat);

            },
            error: function () {
                alert("error receiving wind data from openweathermap");
            }
        });
    });
    //getting json function ends here

    //popupfunction ends here
}
// add popup
map.on('click', onMapClick);

// location functions 
// TODO allow for text entry and autocomplete city names
{

    function selectCity(value) {
        console.log("selected city: " + value);
        var coords = null;
        if (value == "current_location") {
            // wait for coords to be set
            while (coords == null) {
                coords = getCurrentLocation();
            }
            // TODO fix this so it updates the weather data views
            // fetch data for selected city
            // fetchWeatherDataAndMakeTable(coords = coords);
            // fetch forecast data for selected city
            // fetchWeatherForecastAndDisplayTable(coords = coords);
        } else {
            coords = geolocateCity(value);
            // fetch data for selected city
            fetchWeatherDataAndMakeTable(value);
            // fetch forecast data for selected city
            fetchWeatherForecastAndDisplayTable(value);
        }
        var slider = d3.select("#time_slider");
        // move slider to 3
        slider.property("value", 3);
        // set map view to city coords
        setMapView(coords);
    }
}


// cleanup functionality 
{
    document.getElementsByClassName('leaflet-control-attribution')[0].style.display = 'none';
}

// Get all inputs that have a word limit
document.querySelectorAll('input[data-max-words]').forEach(input => {
    // Remember the word limit for the current input
    let maxWords = parseInt(input.getAttribute('data-max-words') || 0)
    // Add an eventlistener to test for key inputs
    input.addEventListener('keydown', e => {
        let target = e.currentTarget
        // Split the text in the input and get the current number of words
        let words = target.value.split(/\s+/).length
        // If the word count is > than the max amount and a space is pressed
        // Don't allow for the space to be inserted
        if (!target.getAttribute('data-announce'))
            // Note: this is a shorthand if statement
            // If the first two tests fail allow the key to be inserted
            // Otherwise we prevent the default from happening
            words >= maxWords && e.keyCode == 32 && e.preventDefault()
        else
            words >= maxWords && e.keyCode == 32 && (e.preventDefault() || alert('Word Limit Reached'))
    })
})

// a function that calls to an api and returns a list of every major city in the world
function getCityList() {
    var cityList = [];
    $.ajax({
        url: "https://raw.githubusercontent.com/David-Haim/CountriesToCitiesJSON/master/countriesToCities.json",
        dataType: "json",
        success: function (data) {
            for (var country in data) {
                for (var city in data[country]) {
                    cityList.push(data[country][city]);
                }
            }
        },
        async: false
    });
    return cityList;
}

var city_list = getCityList();

$("#city_input").autocomplete({
    source: city_list,
    minLength: 3,
    select: function (event, ui) {
        selectCity(ui.item.value);
    }
});

setTimeout(function () {
    map.invalidateSize(true);
}, 100);