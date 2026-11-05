# Urban Chanakya website

Website for [urbanchanakya.in](https://urbanchanakya.in): AI and future skills education.

Live site: https://urbanchanakya-website.vercel.app

Plain HTML, CSS and JavaScript with no build step.

## Structure

```text
index.html                      Home
google-ai-educator-series.html  Google AI Educator Series
canva-for-education.html        Canva for Education
team.html                       Team: management, trainers and associates
404.html                        Page not found, served by Vercel for missing addresses
css/styles.css                  Styles for every page
js/script.js                    Scripts for every page
js/india-outline.js             India boundary for the home page globe
assets/logos/                   Urban Chanakya, Google for Education and Canva logos, favicons
assets/team/                    Team photos
vercel.json                     Hosting settings
```

## Run locally

```bash
python -m http.server 5500
```

Then open http://localhost:5500.

## Deploy

Pushing to `main` deploys automatically on Vercel.
