# Urban Chanakya website

Website for [urbanchanakya.in](https://urbanchanakya.in): AI & future skills education, in collaboration with Google and Canva.

Plain HTML, CSS and JavaScript. No build step.

| Page | File |
| --- | --- |
| Home | `index.html` |
| Trainers | `trainers.html` |
| Canva for Education | `canva.html` |

Shared styles are in `styles.css`, scripts in `script.js`, and images in `assets/`.

## Run locally

```bash
python -m http.server 5500
```

Then open http://localhost:5500.

## Deploy

Pushing to `main` deploys automatically on Vercel once the repository is connected.

Live site: https://urbanchanakya-website.vercel.app
