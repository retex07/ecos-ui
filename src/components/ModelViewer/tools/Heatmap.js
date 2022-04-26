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

export default class HeatmapWrapper {
  instance;
  origData;
  #instModel;
  #mapData;
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
    this.#mapData = null;
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

  getPreparedData({ data, onChange }) {
    this.#mapData = {};

    const shapePoints = [];
    const connectionPoints = [];
    const elementRegistry = this.#instModel.get('elementRegistry');
    const canvas = this.#instModel.get('canvas');
    const { iX, iY, iH, iW, X, Y, scale } = this.viewboxData;

    // get all shapes and connections
    const shapes = elementRegistry.filter(element => !element.waypoints && element.parent && element.type !== 'label');
    const connections = elementRegistry.filter(element => !!element.waypoints && element.parent);

    shapes.forEach(shape => {
      const { x, y, width: w, height: h, type, id } = shape;
      const shapeX = x * scale - X * scale + (X < 0 ? (X - oX) * scale : X > 0 ? (X - oX) * scale : 0);
      const shapeY = y * scale - Y * scale + (Y > 0 ? (Y - oY) * scale : 0);
      const shapeW = w * scale;
      const shapeH = h * scale;

      data.forEach(heat => {
        if (id === heat.id) {
          let fun;
          if (includes(type, 'Task')) {
            fun = getTaskShapePoints;
          } else {
            fun = getUnknownShapePoints;
          }

          const points = fun(shapeX, shapeY, shapeW, shapeH, heat.value);
          this.#mapData[heat.id] = points;
          shapePoints.push(...points);
        }
      });
    });

    connections.forEach(connection => {
      canvas.addMarker(connection.id, 'connection-shadow');
    });

    const points = shapePoints.concat(connectionPoints);
    this.#container = canvas._container;
    const config = {
      container: this.#container,
      width: iW,
      height: iH,
      radius: 45 * scale,
      maxOpacity: 0.8,
      minOpacity: 0,
      blur: 0.75,
      onExtremaChange: data => this.instance && isFunction(onChange) && onChange(data)
    };

    const values = points.map(item => item.value);
    const maxV = Math.max(...values);
    const heatmapData = { max: maxV, data: points };

    return { config, heatmapData };
  }

  draw = ({ info, onMounted }) => {
    this.instance = Heatmap.create(info.config);
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
    const key = this.#mapData && Object.keys(this.#mapData).find(k => this.#mapData[k].find(point => point.x === x && point.y === y));
    const data = this.origData && this.origData.data.find(item => key === item.id);
    const text = data && !isNil(data.value) ? data.value : `${t(Labels.TIP_AVG_VAL)}: ${this.instance.getValueAt({ x, y })}`;

    Tooltip.draw({ hidden: false, text, coords: { x, y } });
  };

  #onmouseout = () => {
    Tooltip.draw({ hidden: true });
  };
}
