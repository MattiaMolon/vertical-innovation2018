const fetch = require('node-fetch');
const { URL, URLSearchParams } = require('url');

// Should be in format {lat, lng}
exports.getWeatherInfo = async (location) => {

    const hostname = 'http://tourism.opendatahub.bz.it';

    const api_body = {
        username: 'tourism@hackathon.bz.it',
        pswd: 'V3rT1c4lInn0v4ti0n$'
    };

    const api_path = '/api/LoginApi';
    const api_token = await fetch(hostname + api_path, {
        method: 'post',
        body: JSON.stringify(api_body),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(res => res.json())
        .then(json => json.access_token);

    const weather_path = '/api/Weather/Realtime';

    const url = new URL(hostname + weather_path);
    const params = {
        language: 'it',
        api_key: api_token
    };
    url.search = new URLSearchParams(params);

    const weather = await fetch(url.href, {
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + api_token
        }
    })
        .then(res => res.json());

    const cities_with_location_and_temp = weather.map(entry => {
        return {
            name: entry.name,
            lat: entry.latitude,
            lng: entry.longitude,
            temp: entry.t,
            precipitations: entry.n
        };
    });

    let closest;
    let distance = Number.MAX_SAFE_INTEGER;
    cities_with_location_and_temp.forEach(location => {
        let min = getDistanceFromLatLonInKm(location.lat, location.lng, location.lat, location.lng);
        if (distance > min) {
            closest = location;
            distance = min;
        }
    });

    return {
        temperature: closest.temp,
        precipitation: closest.precipitations
    };
};

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}