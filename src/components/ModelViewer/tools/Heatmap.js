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
    const { iX, iY, H, W, X, Y, scale } = this.viewboxData;

    // get all shapes and connections
    const shapes = elementRegistry.filter(element => !element.waypoints && element.parent && element.type !== 'label');
    const connections = elementRegistry.filter(element => !!element.waypoints && element.parent);

    shapes.forEach(shape => {
      if (shape.hidden) {
        return;
      }

      const { x, y, width: w, height: h, type, id } = shape;
      //todo check
      const shapeX = x * scale - X * scale + (X < 0 ? (X - iX) * scale : X > 0 ? (X - iX) * scale : 0);
      // console.log({ x, scale, X, iX })
      // console.log( x * scale , X * scale , X - iX)
      const shapeY = y * scale - Y * scale + (Y > 0 ? (Y - iY) * scale : 0);
      // console.log(shapeX, shapeY)
      const shapeW = w * scale;
      const shapeH = h * scale;

      if (mapData[id]) {
        let fun;
        if (includes(type, 'Task')) {
          fun = getTaskShapePoints;
        } else {
          fun = getUnknownShapePoints;
        }

        const points = fun(shapeX, shapeY, shapeW, shapeH, mapData[id].value);
        this.#mapPoints[id] = points;
        shapePoints.push(...points);
      }
    });

    const conRadius = Math.round(20 * scale);

    connections.forEach(con => {
      if (con.hidden) {
        return;
      }
      const conPoints = [];
      const { waypoints } = con;

      waypoints.forEach(item => {
        conPoints.push({
          x: Math.abs(X - item.x),
          y: Math.abs(item.y),
          value: mapData[con.id] ? mapData[con.id].value : 0,
          radius: conRadius
        });
      });

      //todo fill between points depends on scale
      // if (conPoints.length > 1) {
      //   let addPoints;
      //   for (let i = 1; i < conPoints.length; i++) {
      //     const { x: x1, y: y1 } = conPoints[i - 1];
      //     const { x: x2, y: y2 } = conPoints[i];
      //     const amount = Math.round(Math.abs((x2 - x1) / conRadius));
      //     addPoints = [];
      //     addPoints.push({ ...conPoints[i - 1], x: x1 + (x2 - x1)/2, y: y1 + (y2 - y1)/2  })
      //     // let x = x1, y = y1;
      //     // for (let j = 0; j < addPoints.length; j++) {
      //     //   x += conRadius;
      //     //   y += conRadius;
      //     //   addPoints[j] = { ...conPoints[i - 1], x, y  };
      //     // }
      //   }
      //   debugger;
      //   conPoints.push(...addPoints);
      // }

      connectionPoints.push(...conPoints);
      //canvas.addMarker(con.id, 'con-shadow');
    });

    const points = shapePoints.concat(connectionPoints);

    this.#container = canvas._container;

    const config = {
      container: this.#container,
      width: +W + (X < 0 ? Math.round(+((X - iX) * scale)) : X > 0 ? -(X - iX) * scale : 0),
      height: +H + (Y > 0 ? Math.round(+((Y - iY) * scale)) : 0),
      radius: 45 * scale,
      maxOpacity: 0.8,
      minOpacity: 0,
      blur: 0.75,
      onExtremaChange: data => this.instance && isFunction(onChange) && onChange(data)
    };

    const values = data.map(item => item.value);
    const maxV = Math.max(...values);
    const heatmapData = { max: maxV, data: points };

    return { config, heatmapData };
  }

  draw = ({ info, onMounted }) => {
    this.instance = Heatmap.create(info.config);
    this.instance.setData(info.heatmapData);
    //const { X, Y, iX, iY, scale } = this.viewboxData;
    //debugger;
    //this.canvas.style.left = `${X < 0 ? -((X - iX) * scale) : (X > 0 ? -(X - iX) * scale : 0)}px`;
    //this.canvas.style.top = `${Y > 0 ? -((Y - iY) * scale) : 0}px`;
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
