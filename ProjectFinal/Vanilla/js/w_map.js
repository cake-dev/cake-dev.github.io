console.log("w_map.js loaded");

// create map object
var map = L.map("weather_map");

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

    function geolocateCity(city) {
        var coords = {};
        var url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + api_key;
        $.getJSON(url, function (data) {
            var lat = data.coord.lat;
            var lon = data.coord.lon;
            coords.lat = lat;
            coords.lon = lon;
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
}


// WEATHER DATA TABLE functions
{
    function fetchWeatherDataAndMakeTable(city_name = "Missoula") {

        // create table
        var city = city_name;
        var country = "US";
        var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&appid=" + api_key;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // string version of a table using all the data and table tags, creating a vertical table
                var table_string = "<table id='weather_table'><tr><th>City: </th><td>" + data.name + "</td></tr><tr><th>Country: </th><td>" + data.sys.country + "</td></tr><tr><th>Date: </th><td>" + epochToDate(data.dt) + "</td></tr><tr><th>Temperature: </th><td>" + kelvinToFahrenheit(data.main.temp).toFixed(1) + "°F</td></tr><tr><th>Weather: </th><td>" + data.weather[0].main + "</td></tr><tr><th>Humidity: </th><td>" + data.main.humidity + "%</td></tr><tr><th>Wind Speed/Direction: </th><td>" + data.wind.speed + "mph/" + data.wind.deg + "°</td></tr><tr><th>Cloud Coverage: </th><td>" + data.clouds.all + "%</td></tr><tr><th>Sunrise: </th><td>" + epochToTime(data.sys.sunrise) + "</td></tr><tr><th>Sunset: </th><td>" + epochToTime(data.sys.sunset) + "</td></tr></table>";
                d3.select("#weather_data_table").html(table_string);
            })
    }

}
fetchWeatherDataAndMakeTable();

// WEATHER MAP functions
{
    function fetchWeatherMapAndDisplay(city_name = "Missoula") {
        var city = city_name;
        var country = "US";
        var city_coords = geolocateCity(city);

        var clouds = L.OWM.clouds({ opacity: 0.8, appId: api_key });
        var cloudscls = L.OWM.cloudsClassic({ opacity: 0.5, appId: api_key });
        var precipitation = L.OWM.precipitation({ opacity: 0.5, appId: api_key });
        var precipitationcls = L.OWM.precipitationClassic({ opacity: 0.5, appId: api_key });
        var rain = L.OWM.rain({ opacity: 0.5, appId: api_key });
        var raincls = L.OWM.rainClassic({ opacity: 0.5, appId: api_key });
        var snow = L.OWM.snow({ opacity: 0.5, appId: api_key });
        var pressure = L.OWM.pressure({ opacity: 0.4, appId: api_key });
        var temp = L.OWM.temperature({ opacity: 0.5, appId: api_key });
        var wind = L.OWM.wind({ opacity: 0.5, appId: api_key });

        var current_city = L.OWM.current({
            intervall: 15, minZoom: 5,
            appId: api_key
        });

        console.log(city_coords);

        var overlayMaps = {};
        overlayMaps['Clouds'] = clouds;
        overlayMaps['Clouds (alt)'] = cloudscls;
        overlayMaps['Precipitation'] = precipitation;
        overlayMaps['Precipitation (alt)'] = precipitationcls;
        overlayMaps['Rain'] = rain;
        overlayMaps['Rain (alt)'] = raincls;
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
            ext: 'png'
        });

        var basemap_layers = {
            "Stamen Toner": Stamen_Toner,
            "Stamen Terrain": L.tileLayer(stamen_terrain_tiles),
            "ESRI World Street Map": L.tileLayer(basemap_tiles),
        }

        // wait 1/2 second
        setTimeout(function () {
            map.setView([city_coords.lat, city_coords.lon], 9);
        }, 500);

        // L.tileLayer(basemap_tiles, {}).addTo(map);
        Stamen_Toner.addTo(map);

        // add layer controls

    }

    function setMapView(coords) {
        setTimeout(function () {
            map.setView([coords.lat, coords.lon], 9);
        }, 500);
    }
}
fetchWeatherMapAndDisplay();

// WEATHER FORECAST functions
{
    function fetchWeatherForecastAndDisplay(city_name = "Missoula") {
        var city = city_name;
        var country = "US";
        var city_coords = geolocateCity(city);

        var owm_url = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + country + "&units=imperial&appid=" + api_key;
        console.log(owm_url);

        d3.json(owm_url)
            .then(function (data) {
                console.log(data);
                var forecast_data = data.list;
                var forecast_data_table = d3.select("#weather_forecast_table");
                var table_string = "<table class='table table-bordered table-striped table-hover'>";
                table_string += "<thead><tr><th>Time</th><th>Temp</th><th>Humidity</th><th>Pressure</th><th>Wind</th><th>Clouds</th><th>Weather</th></tr></thead>";
                table_string += "<tbody>";
                forecast_data.forEach(function (forecast) {
                    var forecast_time = new Date(forecast.dt * 1000);
                    var forecast_time_string = forecast_time.toLocaleString();
                    var forecast_temp = forecast.main.temp.toFixed(1);
                    var forecast_humidity = forecast.main.humidity;
                    var forecast_pressure = forecast.main.pressure;
                    var forecast_wind = forecast.wind.speed;
                    var forecast_clouds = forecast.clouds.all;
                    var forecast_weather = forecast.weather[0].main;
                    table_string += "<tr>";
                    table_string += "<td>" + forecast_time_string + "</td>";
                    table_string += "<td>" + forecast_temp + "</td>";
                    table_string += "<td>" + forecast_humidity + "</td>";
                    table_string += "<td>" + forecast_pressure + "</td>";
                    table_string += "<td>" + forecast_wind + "</td>";
                    table_string += "<td>" + forecast_clouds + "</td>";
                    table_string += "<td>" + forecast_weather + "</td>";
                    table_string += "</tr>";
                });
                table_string += "</tbody>";
                table_string += "</table>";
                forecast_data_table.html(table_string);

                // TODO create a chart / widget to display the forecast data
                // for the widget, reference the widgets from OWM

            })
    }
}
fetchWeatherForecastAndDisplay();

//popup function
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
                popup.setContent("Weatherdata:<br>" + "<img src=" + weathercondtioniconhtml + "><br>" + weatherconditionstring + " (Weather-ID: " + weatherconditionid + "): " + weatherconditiondescription + "<br><br>Temperature: " + temperaturefahrenheit + "°F<br>Airpressure: " + airpressure + " hPa<br>Humidity: " + airhumidity + "%" + "<br>Cloudcoverage: " + cloudcoverage + "%<br><br>Windspeed: " + windspeedkmh + " km/h<br>Wind from direction: " + winddirectionstring + " (" + winddirection + "°)" + "<br><br><font size=" + fontsizesmall + ">Datasource:<br>openweathermap.org<br>Measure time: " + weathertimenormal + "<br>Weatherstation: " + weatherstationname + "<br>Weatherstation-ID: " + weatherstationid + "<br>Weatherstation Coordinates: " + weatherlocation_lon + ", " + weatherlocation_lat);
                var closest_city = getCityName(e.latlng.lat, e.latlng.lng);
                console.log(closest_city);

            },
            error: function () {
                alert("error receiving wind data from openweathermap");
            }
        });
    });
    //getting json function ends here

    //popupfunction ends here
}
//popup
map.on('click', onMapClick);

// location functions 
// TODO allow for text entry and autocomplete city names
{
    function selectCity(value) {
        console.log(value);
        // fetch data for selected city
        fetchWeatherDataAndMakeTable(value);
        var coords = geolocateCity(value);
        // wait 1/2 second
        setMapView(coords);
    }
}

document.getElementsByClassName('leaflet-control-attribution')[0].style.display = 'none';