import Heatmap from 'heatmap.js';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import includes from 'lodash/includes';
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';

import { t } from '../../../helpers/util';
import { Labels } from '../util';
import { getTaskShapePoints, getUnknownShapePoints } from './util';
import Tooltip from './Tooltip';
import EcosPlugin from './custom/ecosPlugin';

Heatmap.register('ecos', EcosPlugin);

export default class HeatmapWrapper {
  instance;
  origData;
  #instModel;
  #mapPoints;
  #container;

  constructor({ instModel, data, hasTooltip, onChange, onMounted }) {
    this.#instModel = instModel;
    this.origData = cloneDeep({ data, hasTooltip, onChange, onMounted });

    const info = this.getPreparedData({ data, onChange });
    this.draw({ info, onMounted });

    hasTooltip && this.drawTooltip();
  }

  destroy = () => {
    Tooltip.destroy();
    this.instance && this.instance._renderer.canvas.remove();
    this.instance = null;
    this.origData = null;
    this.#mapPoints = null;
    this.#instModel = null;
    this.#container.removeEventListener('mousemove', this.#onmousemove);
    this.#container.removeEventListener('mouseout', this.#onmouseout);
  };

  get canvas() {
    return get(this.instance, '_renderer.canvas');
  }

  get viewboxData() {
    const viewbox = this.#instModel.get('canvas').viewbox();

    const {
      inner: { x: iX, y: iY, height: iH, width: iW },
      outer: { height: H, width: W },
      x: X,
      y: Y,
      scale // zoom rate
    } = viewbox;

    return { iX, iY, iH, iW, H, W, X, Y, scale };
  }

  repaint() {
    this._updateTransform();
    this.instance && this.instance.repaint();
  }

  _updateTransform() {
    const { scale, X, Y } = this.viewboxData;
    this.instance._renderer.setOffsetAndScale(X, Y, scale);
  }

  get opacity() {
    return this.canvas.style.opacity;
  }

  getPreparedData({ data, onChange }) {
    this.#mapPoints = {};
    const mapData = {};
    data.forEach(item => (mapData[item.id] = item));

    const shapePoints = [];
    const connectionPoints = [];
    const elementRegistry = this.#instModel.get('elementRegistry');
    const canvas = this.#instModel.get('canvas');
    const { H, W } = this.viewboxData;

    // get all shapes and connections
    const shapes = elementRegistry.filter(element => !element.waypoints && element.parent && element.type !== 'label');
    const connections = elementRegistry.filter(element => !!element.waypoints && element.parent);

    shapes.forEach(shape => {
      if (shape.hidden) {
        return;
      }

      const { x, y, width, height, type, id } = shape;

      if (mapData[id]) {
        let fun;
        if (includes(type, 'Task')) {
          fun = getTaskShapePoints;
        } else {
          fun = getUnknownShapePoints;
        }

        const points = fun(x, y, width, height, mapData[id].value);
        this.#mapPoints[id] = points;
        shapePoints.push(...points);
      }
    });

    connections.forEach(con => {
      if (con.hidden || !mapData[con.id]) {
        return;
      }

      const wayPoints = con.waypoints.map(item => ({
        //todo different props for line drawing + new in Canvas2dRenderer._getPointTemplate
        x: Math.abs(item.x),
        y: Math.abs(item.y),
        value: mapData[con.id] ? mapData[con.id].value : 0,
        radius: 20
      }));

      connectionPoints.push(...wayPoints);
    });

    const points = shapePoints.concat(connectionPoints);

    this.#container = canvas._container;

    const config = {
      container: this.#container,
      width: +W,
      height: +H,
      radius: 45,
      maxOpacity: 0.8,
      minOpacity: 0,
      blur: 0.75,
      plugin: 'ecos',
      onExtremaChange: data => this.instance && isFunction(onChange) && onChange(data)
    };

    let minV = 0;
    let maxV = 0;
    if (points.length) {
      minV = points[0].value || 0;
      maxV = points[0].value || 0;
      for (let point of points) {
        const value = point.value || 0;
        minV = value < minV ? value : minV;
        maxV = value > maxV ? value : maxV;
      }
    }
    const heatmapData = { max: maxV, min: minV, data: points };

    return { config, heatmapData };
  }

  draw = ({ info, onMounted }) => {
    this.instance = Heatmap.create(info.config);
    this._updateTransform();
    this.instance.setData(info.heatmapData);
    isFunction(onMounted) && onMounted(true);
  };

  updateData = data => {
    const info = this.getPreparedData({ data });
    this.instance.setData(info.heatmapData);
  };

  toggleDisplay = isHidden => {
    this.canvas && this.canvas.classList.toggle('d-none', isHidden);
  };

  setOpacity = val => {
    this.canvas && (this.canvas.style.opacity = val);
  };

  drawTooltip = () => {
    Tooltip.create(this.#container);
    this.#container.addEventListener('mousemove', this.#onmousemove);
    this.#container.addEventListener('mouseout', this.#onmouseout);
  };

  #onmousemove = ev => {
    const x = ev.layerX;
    const y = ev.layerY;
    const key = this.#mapPoints && Object.keys(this.#mapPoints).find(k => this.#mapPoints[k].find(point => point.x === x && point.y === y));
    const data = this.origData && this.origData.data.find(item => key === item.id);
    const text = data && !isNil(data.value) ? data.value : `${t(Labels.TIP_AVG_VAL)}: ${this.instance.getValueAt({ x, y })}`;

    Tooltip.draw({ hidden: false, text, coords: { x, y } });
  };

  #onmouseout = () => {
    Tooltip.draw({ hidden: true });
  };
}
