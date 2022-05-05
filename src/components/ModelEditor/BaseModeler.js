import React, { useEffect, useRef, useState } from 'react';
import get from 'lodash/get';
import isNil from 'lodash/isNil';

/**
 * Expansion for Modeler
 * @class
 *
 * @param {Modeler} viewer - shows whose container is. You can set using setCustomContainer
 * @param {Object} events - custom events for objects of model
 * Available events: onSelectElement, onChangeElement, onClickElement
 * @param {Boolean} isCustomContainer - shows whose container is. You can set using setCustomContainer
 */
export default class BaseModeler {
  modeler;
  events = {};
  _isCustomContainer = false;
  _isDiagramMounted = false;

  initModelerInstance = () => {
    this.modeler = null;
  };

  /**
   * @constructor
   * @param {String} diagram - initial xml diagram
   * @param container - html element where diagram draws
   * @param {Object} events - any events you want to use.
   * @param {Object} extraEvents - Additional events. You can see the keys of all available events through the this.getEventBus() command {@see getEventBus}
   */
  init = async ({ diagram, container, events, extraEvents }) => {
    this.initModelerInstance();

    if (container) {
      this.modeler.attachTo(container);
    }

    this.setDiagram(diagram);
    this.setEvents(events, extraEvents);
  };

  get elementDefinitions() {
    return null;
  }

  get isCustomContainer() {
    return this._isCustomContainer;
  }

  get isDiagramMounted() {
    return this._isDiagramMounted;
  }

  getEventBus() {
    return this.modeler.get('eventBus');
  }

  setDiagram = diagram => {
    if (this.modeler && diagram) {
      this.modeler.importXML(diagram, error => {
        if (error) {
          console.error('Error rendering', error);
        } else {
          this._isDiagramMounted = true;
        }
      });
    } else {
      console.warn('No diagram');
    }
  };

  /**
   * Set events of modeler
   *
   * @param events
   * @param {Object} extraEvents - events by key from {@see getEventBus}, for example:
   * - create.end - fired after adding element
   * - element.updateId - fired after changing element ID (for example, when changing the element type through a wrench).
   * - selection.changed - fired after every change of selected element
   */
  setEvents = (events, extraEvents) => {
    // unsubscribe for added events in this.destroy below

    if (this.modeler && (events || extraEvents)) {
      this.events = {};

      if (events) {
        if (events.onSelectElement) {
          this.events.onSelectElement = e => {
            if (get(e, 'newSelection.length', 0) < 2) {
              events.onSelectElement(get(e, 'newSelection[0]'));
            }
          };
          this.modeler.on('selection.changed', this.events.onSelectElement);
        }

        if (events.onChangeElement) {
          this.events.onChangeElement = e => events.onChangeElement(get(e, 'element'));
          this.modeler.on('element.changed', this.events.onChangeElement);
        }

        if (events.onClickElement) {
          this.events.onClickElement = e => events.onClickElement(get(e, 'element'));
          this.modeler.on('element.click', this.events.onClickElement);
        }

        if (events.onChangeElementLabel) {
          this.events.onChangeElementLabel = e => events.onChangeElementLabel(get(e, 'target.innerText'));
          this.modeler._container.addEventListener('keyup', this.events.onChangeElementLabel);
        }
      }

      if (extraEvents) {
        Object.keys(extraEvents).forEach(key => {
          this.modeler.on(key, extraEvents[key]);
        });
      }
    }
  };

  updateProps = (element, properties) => {
    const { name, ...data } = properties;

    if (!isNil(name)) {
      const labelEditingProvider = this.modeler.get('labelEditingProvider');
      labelEditingProvider.update(element, name);
    }

    if (data) {
      const modeling = this.modeler.get('modeling');
      modeling.updateProperties(element, data);
    }
  };

  setCustomContainer = container => {
    this._isCustomContainer = true;
    this.modeler.attachTo(container);
  };

  /**
   * Return current diagram as XML
   * @param callback - use it to get xml or error
   */
  saveXML = ({ callback }) => {
    if (!this.modeler) {
      return;
    }

    try {
      this.modeler.saveXML({ format: true }, (error, xml) => {
        if (error) {
          throw error;
        }

        callback && callback({ error, xml });
      });
    } catch (error) {
      console.error('Error saving XML', error);
      callback && callback({ error, xml: null });
    }
  };

  /**
   * Return current diagram as SVG
   * @param callback - use it to get svg or error
   */
  saveSVG = ({ callback }) => {
    if (!this.modeler) {
      return;
    }

    try {
      this.modeler.saveSVG({ format: true }, (error, svg) => {
        if (error) {
          throw error;
        }

        callback && callback({ svg });
      });
    } catch (error) {
      console.error('Error saving SVG', error);
      callback && callback({ error, svg: null });
    }
  };

  /**
   * Own component-container for drawing diagram
   * @param {String} xml diagram
   * see available events
   * @return {ReactComponent}
   */
  Sheet = ({ diagram, onMounted, extraEvents, ...props }) => {
    const [initialized, setInitialized] = useState(false);
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef(null);
    const events = {};

    Object.keys(props)
      .filter(key => key.startsWith('on'))
      .forEach(key => (events[key] = props[key]));

    useEffect(() => {
      if (!initialized && get(containerRef, 'current')) {
        this.init({ diagram, container: containerRef.current, events, extraEvents });
        setInitialized(true);
      }
    }, [initialized, containerRef]);

    useEffect(() => {
      if (!mounted && initialized && this.isDiagramMounted) {
        onMounted(true);
        setMounted(true);
      }
    });

    return <div ref={containerRef} className="ecos-model-container" />;
  };

  destroy = () => {
    if (this.events) {
      this.events.onSelectElement && this.modeler.off('selection.changed', this.events.onSelectElement);
      this.events.onChangeElement && this.modeler.off('element.changed', this.events.onChangeElement);
      this.events.onClickElement && this.modeler.off('element.click', this.events.onClickElement);
    }

    if (this.events.onChangeElementLabel) {
      this.modeler._container.removeEventListener('keyup', this.events.onChangeElementLabel);
    }

    this.modeler && this.modeler._emit('diagram.destroy');
  };
}
