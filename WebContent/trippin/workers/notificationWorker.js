
const _owm = {
    apiKey: "ba273f66965a19ce9cd320bda8e78f29",
    serviceUrl: "https://api.openweathermap.org/data/2.5/",
    icon: {
        url: "http://openweathermap.org/img/w/",
        extension: ".png"
    }
};

const _iF2CDegrees = -272.15;
var coords;

const checkWeather = () => {
    let url = _owm.serviceUrl + "weather?lat=" + coords.latitude + "&lon=" + coords.longitude + "&appid=" + _owm.apiKey;

    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            let res = JSON.parse(this.responseText);
            let tempC = res.main.temp + _iF2CDegrees; res.main.tempC_min = res.main.temp_min + _iF2CDegrees; res.main.tempC_max = res.main.temp_max + _iF2CDegrees;

            res.weather.forEach(w => {
                w.iconUrl = _owm.icon.url + w.icon + _owm.icon.extension;
            });

            new Notification(res.name, {
                icon: res.weather[0].iconUrl,
                body: tempC.toFixed(2) + " *C"
            });
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
}

self.addEventListener("message", (m) => {
    coords = m.data;
});

setInterval(() => {
    if (coords)
        checkWeather();
}, 1000 * 60 * 15);