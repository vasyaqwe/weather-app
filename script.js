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

let queries = JSON.parse(localStorage.getItem('queries')) || [];

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
    const [todayData] = data.list;

    todayTempEl.innerText = Math.round(todayData.main.temp);
    todayWeatherEl.innerText = todayData.weather[0].main;
    userLocation.innerText = data.city.name;
    windEl.innerHTML = `
    ${todayData.wind.speed}<span class="fs-600 fw-500">${unit === 'metric' ? 'm/s' : 'mph'}</span>
    `;
    humidityEl.innerText = todayData.main.humidity;
    humidityBar.style.width = `${todayData.main.humidity}%`
    visibilityEl.innerText = todayData.visibility / 1000;
    pressureEl.innerText = todayData.main.pressure;


    const todayImgSrc = `${todayData.weather[0].id}`
    todayImg.src = `./public/${todayImgSrc.slice(0, 1) + '01'}.png`
    tempEls.forEach((tempEl, i) => {
        const today = moment().add(i, 'days').format("YYYY-MM-DD");
        const tempsArr = [];
        const minTempsArr = [];
        data.list.forEach(item => {
            if (item.dt_txt.slice(0, 10) === today) {
                tempsArr.push(item.main.temp)
            }
        });
        data.list.forEach(item => {
            if (item.dt_txt.slice(0, 10) === today) {
                minTempsArr.push(item.main.temp_min);
            }
        });
        const avgTemp = tempsArr.reduce((acc, curr) => acc + curr) / tempsArr.length;
        const avgMinTemp = minTempsArr.reduce((acc, curr) => acc + curr) / minTempsArr.length;

        tempEl.innerText = `${Math.round(avgTemp)}°${unit === 'metric' ? 'C' : 'F'}`;
        tempMinEls[i].innerText = `${Math.round(avgMinTemp)}°${unit === 'metric' ? 'C' : 'F'}`;
        const imgSrc = `${data.list[i].weather[0].id}`;
        if (data.list[i].weather[0].id === 800) {
            imgs[i].src = `./public/${imgSrc}.png`;
        } else {
            imgs[i].src = `./public/${imgSrc.slice(0, 1) + '01'}.png`;
        };
    })
};


function appendDates() {
    const date = moment().format('ddd, MMM Do');
    todayDateEl.innerText = date;

    for (let i = 2; i < cardDates.length; i++) {
        const date = moment().add(i, 'days').format("ddd, MMM Do");
        cardDates[i].innerText = date;
    };
};