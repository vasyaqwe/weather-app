const btnSearch = document.querySelector('.btn-search');
const searchPanel = document.querySelector('.search-panel');
const closeBtn = document.querySelector('.btn-close');
const btnLocation = document.querySelector('.btn-location');
const form = document.querySelector('form');
const errorMsg = document.querySelector('.error-msg');
const searchList = document.querySelector('.search-list');

const tempEls = document.querySelectorAll('.temp');
const tempMinEls = document.querySelectorAll('.temp-min');
const todayTempEl = document.querySelector('.today-temp');
const todayWeatherEl = document.querySelector('.today-weather');
const todayDateEl = document.querySelector('.today-date');
const windEl = document.querySelector('.wind');
const humidityEl = document.querySelector('.humidity');
const humidityBar = document.querySelector('.humidity-bar-inner');
const visibilityEl = document.querySelector('.visibility');
const pressureEl = document.querySelector('.pressure');
const todayImg = document.querySelector('.today-img');

const imgs = document.querySelectorAll('.img');
const cardDates = document.querySelectorAll('.card-date');
const userLocation = document.querySelector('.user-location');
const btnCel = document.querySelector('.btn-celcius');
const btnFar = document.querySelector('.btn-far');

const apiKey = '5fcff164e26c96783eb297228f44e426';

// add queries array to localStorage if there isn't already
if (!localStorage.getItem('queries')) {
    const queries = [];
    localStorage.setItem("queries", JSON.stringify(queries));
};
let queries = JSON.parse(localStorage.getItem('queries'));


appendSearchHistory();
getUserWeather();
appendDates();

function appendSearchHistory() {
    searchList.innerHTML = '';
    queries.forEach(query => {
        const newLi = document.createElement('li');
        newLi.classList.add('search-item');
        newLi.innerHTML = `${query[0].toUpperCase() + query.slice(1, query.length)}<i class="fa-solid fa-chevron-right text-border"></i>`;
        searchList.append(newLi);
        newLi.addEventListener('click', async () => {
            const unit = document.querySelector('[aria-selected="true"]').getAttribute('data-unit');
            const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${newLi.innerText}&units=${unit}&appid=${apiKey}`)
            const data = await res.json();
            appendWeatherHtml(data);
        });
    });
};

btnCel.addEventListener('click', (e) => {
    e.target.setAttribute('aria-selected', true);
    btnFar.setAttribute('aria-selected', false);

    getWeather(userLocation.innerText);
});
btnFar.addEventListener('click', (e) => {
    e.target.setAttribute('aria-selected', true);
    btnCel.setAttribute('aria-selected', false);

    getWeather(userLocation.innerText);
});

btnLocation.addEventListener('click', async () => {
    getUserWeather();
});

form.addEventListener('submit', (e) => {
    const query = e.target.firstElementChild.value.toLowerCase();
    e.preventDefault();
    if (query) {
        getWeather(query);
        if (!queries.includes(query)) {
            queries.push(query);
            localStorage.setItem("queries", JSON.stringify(queries));
            appendSearchHistory();
        };
    };
});

btnSearch.addEventListener('click', () => {
    searchPanel.setAttribute('data-visible', true);
});
closeBtn.addEventListener('click', () => {
    searchPanel.setAttribute('data-visible', false);
});

function getUserWeather() {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude.toFixed(2);
        const lon = position.coords.longitude.toFixed(2);
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        const data = await res.json();
        appendWeatherHtml(data);
    });
};


async function getWeather(query = 'netishyn') {
    try {
        const unit = document.querySelector('[aria-selected="true"]').getAttribute('data-unit');
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=${unit}&appid=${apiKey}`)
        const data = await res.json();
        appendWeatherHtml(data);
        errorMsg.setAttribute('data-visible', false);
    } catch (e) {
        errorMsg.setAttribute('data-visible', true);
    };
};


function appendWeatherHtml(data) {
    const unit = document.querySelector('[aria-selected="true"]').getAttribute('data-unit');

    todayTempEl.innerText = Math.round(data.list[0].main.temp);
    todayWeatherEl.innerText = data.list[0].weather[0].main;
    userLocation.innerText = data.city.name;
    windEl.innerHTML = `
    ${data.list[0].wind.speed}<span class="fs-600 fw-500">${unit === 'metric' ? 'm/s' : 'mph'}</span>
    `;
    humidityEl.innerText = data.list[0].main.humidity;
    humidityBar.style.width = `${data.list[0].main.humidity}%`
    visibilityEl.innerText = data.list[0].visibility / 1000;
    pressureEl.innerText = data.list[0].main.pressure;


    const imgSrc = `${data.list[0].weather[0].id}`
    todayImg.src = `./public/${imgSrc.slice(0, 1) + '01'}.png`
    for (let i = 0; i < tempEls.length; i++) {
        let day = new Date();
        const dd = String(day.getDate() + i).padStart(2, '0');
        const mm = String(day.getMonth() + 1).padStart(2, '0');
        const yyyy = day.getFullYear();
        day = yyyy + '-' + mm + '-' + dd;

        const tempsArr = [];
        const minTempsArr = [];
        const arr = data.list.filter(item => item.dt_txt.slice(0, 10) === day);
        arr.forEach(item => tempsArr.push(item.main.temp));
        arr.forEach(item => minTempsArr.push(item.main.temp_min));
        const avgTemp = tempsArr.reduce((acc, curr) => acc + curr) / tempsArr.length;
        const avgMinTemp = minTempsArr.reduce((acc, curr) => acc + curr) / minTempsArr.length;
        tempEls[i].innerText = `${Math.round(avgTemp)}°${unit === 'metric' ? 'C' : 'F'}`;
        tempMinEls[i].innerText = `${Math.round(avgMinTemp)}°${unit === 'metric' ? 'C' : 'F'}`;
        const imgSrc = `${arr[i].weather[0].id}`;
        if (arr[i].weather[0].id === 800) {
            imgs[i].src = `./public/${imgSrc}.png`;
        } else {
            imgs[i].src = `./public/${imgSrc.slice(0, 1) + '01'}.png`;
        };
    };
};


function appendDates() {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const newDate = new Date();
    const today = newDate.toLocaleDateString("en-US", options);
    todayDateEl.innerText = today;
    for (let i = 2; i < cardDates.length; i++) {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + i);
        const date = newDate.toLocaleDateString("en-US", options);
        cardDates[i].innerText = date;
    };
};
