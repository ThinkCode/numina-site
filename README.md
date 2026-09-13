# numina.bytexio.com

The website for [Numina](https://numina.bytexio.com), a brain-training game for iPhone, iPad and Apple Watch.

Static HTML, served by GitHub Pages. No build step for the landing page.

## Legal pages

`privacy.html` and `terms.html` are **generated** from the Markdown the app itself bundles
(`Numina/Resources/Legal/*.md` in the app repo), so the website and the in-app pages can never
disagree. To refresh them after editing the source:

```bash
python3 build_legal.py /path/to/BrainTuner
```

Do not edit the two HTML files by hand.

## Custom domain

`CNAME` pins `numina.bytexio.com`. DNS needs a `CNAME` record for `numina` pointing at
`thinkcode.github.io`.
