console.log("w_map.js loaded");

// Dropdown
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

// WEATHER DATA TABLE
function fetchWeatherDataAndMakeTable(city_name = "Missoula") {
    var city = city_name;
    var country = "US";
    var api_key = "8f7c8250dda489ee29edf30dd09ee65b";
    var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&appid=" + api_key;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            var table = document.getElementById("weather_table");
            // city
            var city_row = table.insertRow(1);
            var city_title = city_row.insertCell(0);
            city_title.innerHTML = "City: ";
            var city_cell = city_row.insertCell(1);
            city_cell.innerHTML = data.name;
            // country
            var country_row = table.insertRow(2);
            var country_title = country_row.insertCell(0);
            country_title.innerHTML = "Country: ";
            var country_cell = country_row.insertCell(1);
            country_cell.innerHTML = data.sys.country;
            // date
            var date_row = table.insertRow(3);
            var date_title = date_row.insertCell(0);
            date_title.innerHTML = "Date: ";
            var date_cell = date_row.insertCell(1);
            date_cell.innerHTML = epochToDate(data.dt);
            // temp
            var temp_row = table.insertRow(4);
            var temp_title = temp_row.insertCell(0);
            temp_title.innerHTML = "Temperature: ";
            var temp_cell = temp_row.insertCell(1);
            temp_cell.innerHTML = kelvinToFahrenheit(data.main.temp).toFixed(2) + "°F";
            // weather
            var w_row = table.insertRow(5);
            var w_title = w_row.insertCell(0);
            w_title.innerHTML = "Weather: ";
            var w_cell = w_row.insertCell(1);
            w_cell.innerHTML = data.weather[0].main;
            // humidity
            var humid_row = table.insertRow(6);
            var humid_title = humid_row.insertCell(0);
            humid_title.innerHTML = "Humidity: ";
            var humid_cell = humid_row.insertCell(1);
            humid_cell.innerHTML = data.main.humidity + "%";
            // wind 
            var wind_row = table.insertRow(7);
            var wind_title = wind_row.insertCell(0);
            wind_title.innerHTML = "Wind Speed/Direction: ";
            var wind_cell = wind_row.insertCell(1);
            wind_cell.innerHTML = data.wind.speed + "mph/" + data.wind.deg + "°";
            // clouds
            var cloud_row = table.insertRow(8);
            var cloud_title = cloud_row.insertCell(0);
            cloud_title.innerHTML = "Cloud Coverage: ";
            var cloud_cell = cloud_row.insertCell(1);
            cloud_cell.innerHTML = data.clouds.all + "%";
            // sunrise
            var sunrise_row = table.insertRow(9);
            var sunrise_title = sunrise_row.insertCell(0);
            sunrise_title.innerHTML = "Sunrise: ";
            var sunrise_cell = sunrise_row.insertCell(1);
            sunrise_cell.innerHTML = epochToTime(data.sys.sunrise);
            // sunset
            var sunset_row = table.insertRow(10);
            var sunset_title = sunset_row.insertCell(0);
            sunset_title.innerHTML = "Sunset: ";
            var sunset_cell = sunset_row.insertCell(1);
            sunset_cell.innerHTML = epochToTime(data.sys.sunset);

        })
}

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

fetchWeatherDataAndMakeTable();

// WEATHER MAP

function fetchWeatherMapAndDisplay(city_name = "Missoula") {
    var city = city_name;
    var country = "US";
    var api_key = "8f7c8250dda489ee29edf30dd09ee65b";
    var layer = "precipitation_new";
    var ow_tiles = "http://tile.openweathermap.org/map/" + layer + "/{z}/{x}/{y}.png?appid=" + api_key;
    var map = L.map("weather_map")
    map.setView([46.87, -113.99], 5);
    L.tileLayer(ow_tiles, {}).addTo(map);
}

fetchWeatherMapAndDisplay();