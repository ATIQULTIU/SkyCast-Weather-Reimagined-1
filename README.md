# ☁️ SkyCast — Weather, Reimagined

A responsive, creative weather dashboard built with **HTML, CSS, and vanilla JavaScript**. Search cities around the world, explore current conditions, check atmospheric details, and plan ahead with a 5-day forecast.

**Developer:** MD Atiqul Islam (Atik)  
**Email:** [atik.cmttiu1001@gmail.com](mailto:atik.cmttiu1001@gmail.com)  
**GitHub:** [ATIQULTIU](https://github.com/ATIQULTIU)

## ✨ Features

- Live weather conditions and 5-day forecast
- City search with geocoding
- Optional browser geolocation
- Celsius / Fahrenheit toggle
- Humidity, wind, visibility, pressure, UV index, and daylight duration
- Responsive dark interface with atmospheric visuals
- Loading, empty, and error states
- No API key or build step required

## 🧰 Tech stack

- HTML5
- CSS3 (responsive layout, gradients, animations, glass-style panels)
- Vanilla JavaScript (Fetch API)
- [Open-Meteo Forecast API](https://open-meteo.com/)
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)

## 🚀 Run locally

Because the app uses browser fetch requests, run it through a local web server instead of opening `index.html` directly.

### Option 1: VS Code Live Server
1. Extract the ZIP and open the folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.

### Option 2: Python
From the project folder, run:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500` in your browser.

## 📁 Project structure

```text
skycast-weather-app/
├── index.html
├── README.md
├── LICENSE
├── .gitignore
├── css/
│   └── style.css
├── js/
│   └── app.js
└── assets/
    └── README.md
```

## 🌐 Publish on GitHub Pages

1. Create a GitHub repository, for example `skycast-weather-app`.
2. Upload the contents of this project folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site.

## 🔌 Data and privacy

Weather data is fetched from Open-Meteo. City search sends the entered city name to the Open-Meteo geocoding endpoint. Browser location is requested only when you click the location button; it is not requested automatically. No API key is needed for this demo.

## 🛠 Troubleshooting

- **No weather appears:** check your internet connection and reload.
- **Location does not work:** allow location access in your browser, and use HTTPS or localhost. You can always search a city manually.
- **Search does not work from a file URL:** use Live Server or `python -m http.server`.
- **Weather API unavailable:** try again later; the project depends on the public Open-Meteo service.

## 📄 License

MIT — see `LICENSE`.

---

Made with ☁️ and curiosity by **MD Atiqul Islam (Atik)**.
