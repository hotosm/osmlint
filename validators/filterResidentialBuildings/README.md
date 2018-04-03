#### Description

Filter buildings with tag `building=residential`. Returns a line delimeted feature collection to stdout. The linter will return a JSON bin for edit recency statistics with the following format:

```
{
  'YYYYM': number of buildings,
  '20138': 75,
  '20139': 416,
  '20140': 363,
  '20142': 159,
  '20143': 132,
  '20144': 1,
  '20145': 20,
  '20147': 19
}
```

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint filterresidentialbuildings peru.mbtiles > peru.json`
