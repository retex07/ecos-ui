// Heatmap Config stores default values and will be merged with instance config
export default {
  defaultRadius: 40,
  defaultRenderer: 'ecos',
  defaultGradient: { 0.25: 'rgb(0,0,255)', 0.55: 'rgb(0,255,0)', 0.85: 'yellow', 1.0: 'rgb(255,0,0)' },
  defaultMaxOpacity: 1,
  defaultMinOpacity: 0,
  defaultBlur: 0.85,
  defaultXField: 'x',
  defaultYField: 'y',
  defaultValueField: 'value',
  plugins: {}
};
