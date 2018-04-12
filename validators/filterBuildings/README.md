#### Description

Filter buildings with tag `building=`. Returns a line delimeted feature collection to stdout. The linter will return a JSON bin for edit recency statistics with the following format:

```
{
  'YYYYMM': number of buildings,
  '201311': 92,
  '201312': 119,
  '201401': 363,
  '201403': 159,
  '201404': 132,
  '201405': 1
}
```

#### Usage

1. Download [OSM QA Tiles](https://osmlab.github.io/osm-qa-tiles/) for the planet or a country that you are interested in. 
2. For example, to run for peru.mbtiles: `osmlint filterbuildings peru.mbtiles > peru.json`
