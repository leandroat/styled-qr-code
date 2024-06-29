// src/tools/calculateImageSize.ts
function calculateImageSize({
  originalHeight,
  originalWidth,
  maxHiddenDots,
  maxHiddenAxisDots,
  dotSize
}) {
  const hideDots = { x: 0, y: 0 };
  const imageSize = { x: 0, y: 0 };
  if (originalHeight <= 0 || originalWidth <= 0 || maxHiddenDots <= 0 || dotSize <= 0) {
    return {
      height: 0,
      width: 0,
      hideYDots: 0,
      hideXDots: 0
    };
  }
  const k = originalHeight / originalWidth;
  hideDots.x = Math.floor(Math.sqrt(maxHiddenDots / k));
  if (hideDots.x <= 0) hideDots.x = 1;
  if (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.x) hideDots.x = maxHiddenAxisDots;
  if (hideDots.x % 2 === 0) hideDots.x--;
  imageSize.x = hideDots.x * dotSize;
  hideDots.y = 1 + 2 * Math.ceil((hideDots.x * k - 1) / 2);
  imageSize.y = Math.round(imageSize.x * k);
  if (hideDots.y * hideDots.x > maxHiddenDots || maxHiddenAxisDots && maxHiddenAxisDots < hideDots.y) {
    if (maxHiddenAxisDots && maxHiddenAxisDots < hideDots.y) {
      hideDots.y = maxHiddenAxisDots;
      if (hideDots.y % 2 === 0) hideDots.x--;
    } else {
      hideDots.y -= 2;
    }
    imageSize.y = hideDots.y * dotSize;
    hideDots.x = 1 + 2 * Math.ceil((hideDots.y / k - 1) / 2);
    imageSize.x = Math.round(imageSize.y / k);
  }
  return {
    height: imageSize.y,
    width: imageSize.x,
    hideYDots: hideDots.y,
    hideXDots: hideDots.x
  };
}

// src/constants/errorCorrectionPercents.ts
var errorCorrectionPercents_default = {
  L: 0.07,
  M: 0.15,
  Q: 0.25,
  H: 0.3
};

// src/constants/dotTypes.ts
var dotTypes_default = {
  dots: "dots",
  rounded: "rounded",
  classy: "classy",
  classyRounded: "classy-rounded",
  square: "square",
  extraRounded: "extra-rounded"
};

// src/figures/dot/QRDot.ts
var QRDot = class {
  constructor({ context, type }) {
    this._context = context;
    this._type = type;
  }
  draw(x, y, size, getNeighbor) {
    const context = this._context;
    const type = this._type;
    let drawFunction;
    switch (type) {
      case dotTypes_default.dots:
        drawFunction = this._drawDot;
        break;
      case dotTypes_default.classy:
        drawFunction = this._drawClassy;
        break;
      case dotTypes_default.classyRounded:
        drawFunction = this._drawClassyRounded;
        break;
      case dotTypes_default.rounded:
        drawFunction = this._drawRounded;
        break;
      case dotTypes_default.extraRounded:
        drawFunction = this._drawExtraRounded;
        break;
      case dotTypes_default.square:
      default:
        drawFunction = this._drawSquare;
    }
    drawFunction.call(this, { x, y, size, context, getNeighbor });
  }
  _rotateFigure({ x, y, size, context, rotation = 0, draw }) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    context.translate(cx, cy);
    rotation && context.rotate(rotation);
    draw();
    context.closePath();
    rotation && context.rotate(-rotation);
    context.translate(-cx, -cy);
  }
  _basicDot(args) {
    const { size, context } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(0, 0, size / 2, 0, Math.PI * 2);
      }
    });
  }
  _basicSquare(args) {
    const { size, context } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.moveTo(0, 0);
        context.rect(-size / 2, -size / 2, size, size);
      }
    });
  }
  //if rotation === 0 - right side is rounded
  _basicSideRounded(args) {
    const { size, context } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(0, 0, size / 2, -Math.PI / 2, Math.PI / 2);
        context.lineTo(-size / 2, size / 2);
        context.lineTo(-size / 2, -size / 2);
        context.lineTo(0, -size / 2);
      }
    });
  }
  //if rotation === 0 - top right corner is rounded
  _basicCornerRounded(args) {
    const { size, context } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(0, 0, size / 2, -Math.PI / 2, 0);
        context.lineTo(size / 2, size / 2);
        context.lineTo(-size / 2, size / 2);
        context.lineTo(-size / 2, -size / 2);
        context.lineTo(0, -size / 2);
      }
    });
  }
  //if rotation === 0 - top right corner is rounded
  _basicCornerExtraRounded(args) {
    const { size, context } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(-size / 2, size / 2, size, -Math.PI / 2, 0);
        context.lineTo(-size / 2, size / 2);
        context.lineTo(-size / 2, -size / 2);
      }
    });
  }
  _basicCornersRounded(args) {
    const { size, context } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(0, 0, size / 2, -Math.PI / 2, 0);
        context.lineTo(size / 2, size / 2);
        context.lineTo(0, size / 2);
        context.arc(0, 0, size / 2, Math.PI / 2, Math.PI);
        context.lineTo(-size / 2, -size / 2);
        context.lineTo(0, -size / 2);
      }
    });
  }
  _basicCornersExtraRounded(args) {
    const { size, context } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(-size / 2, size / 2, size, -Math.PI / 2, 0);
        context.arc(size / 2, -size / 2, size, Math.PI / 2, Math.PI);
      }
    });
  }
  _drawDot({ x, y, size, context }) {
    this._basicDot({ x, y, size, context, rotation: 0 });
  }
  _drawSquare({ x, y, size, context }) {
    this._basicSquare({ x, y, size, context, rotation: 0 });
  }
  _drawRounded({ x, y, size, context, getNeighbor }) {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
    if (neighborsCount === 0) {
      this._basicDot({ x, y, size, context, rotation: 0 });
      return;
    }
    if (neighborsCount > 2 || leftNeighbor && rightNeighbor || topNeighbor && bottomNeighbor) {
      this._basicSquare({ x, y, size, context, rotation: 0 });
      return;
    }
    if (neighborsCount === 2) {
      let rotation = 0;
      if (leftNeighbor && topNeighbor) {
        rotation = Math.PI / 2;
      } else if (topNeighbor && rightNeighbor) {
        rotation = Math.PI;
      } else if (rightNeighbor && bottomNeighbor) {
        rotation = -Math.PI / 2;
      }
      this._basicCornerRounded({ x, y, size, context, rotation });
      return;
    }
    if (neighborsCount === 1) {
      let rotation = 0;
      if (topNeighbor) {
        rotation = Math.PI / 2;
      } else if (rightNeighbor) {
        rotation = Math.PI;
      } else if (bottomNeighbor) {
        rotation = -Math.PI / 2;
      }
      this._basicSideRounded({ x, y, size, context, rotation });
      return;
    }
  }
  _drawExtraRounded({ x, y, size, context, getNeighbor }) {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
    if (neighborsCount === 0) {
      this._basicDot({ x, y, size, context, rotation: 0 });
      return;
    }
    if (neighborsCount > 2 || leftNeighbor && rightNeighbor || topNeighbor && bottomNeighbor) {
      this._basicSquare({ x, y, size, context, rotation: 0 });
      return;
    }
    if (neighborsCount === 2) {
      let rotation = 0;
      if (leftNeighbor && topNeighbor) {
        rotation = Math.PI / 2;
      } else if (topNeighbor && rightNeighbor) {
        rotation = Math.PI;
      } else if (rightNeighbor && bottomNeighbor) {
        rotation = -Math.PI / 2;
      }
      this._basicCornerExtraRounded({ x, y, size, context, rotation });
      return;
    }
    if (neighborsCount === 1) {
      let rotation = 0;
      if (topNeighbor) {
        rotation = Math.PI / 2;
      } else if (rightNeighbor) {
        rotation = Math.PI;
      } else if (bottomNeighbor) {
        rotation = -Math.PI / 2;
      }
      this._basicSideRounded({ x, y, size, context, rotation });
      return;
    }
  }
  _drawClassy({ x, y, size, context, getNeighbor }) {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
    if (neighborsCount === 0) {
      this._basicCornersRounded({ x, y, size, context, rotation: Math.PI / 2 });
      return;
    }
    if (!leftNeighbor && !topNeighbor) {
      this._basicCornerRounded({ x, y, size, context, rotation: -Math.PI / 2 });
      return;
    }
    if (!rightNeighbor && !bottomNeighbor) {
      this._basicCornerRounded({ x, y, size, context, rotation: Math.PI / 2 });
      return;
    }
    this._basicSquare({ x, y, size, context, rotation: 0 });
  }
  _drawClassyRounded({ x, y, size, context, getNeighbor }) {
    const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
    const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
    const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
    const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;
    const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor + bottomNeighbor;
    if (neighborsCount === 0) {
      this._basicCornersRounded({ x, y, size, context, rotation: Math.PI / 2 });
      return;
    }
    if (!leftNeighbor && !topNeighbor) {
      this._basicCornerExtraRounded({ x, y, size, context, rotation: -Math.PI / 2 });
      return;
    }
    if (!rightNeighbor && !bottomNeighbor) {
      this._basicCornerExtraRounded({ x, y, size, context, rotation: Math.PI / 2 });
      return;
    }
    this._basicSquare({ x, y, size, context, rotation: 0 });
  }
};

// src/constants/cornerSquareTypes.ts
var cornerSquareTypes_default = {
  dot: "dot",
  square: "square",
  extraRounded: "extra-rounded"
};

// src/figures/cornerSquare/QRCornerSquare.ts
var QRCornerSquare = class {
  constructor({ context, type }) {
    this._context = context;
    this._type = type;
  }
  draw(x, y, size, rotation) {
    const context = this._context;
    const type = this._type;
    let drawFunction;
    switch (type) {
      case cornerSquareTypes_default.square:
        drawFunction = this._drawSquare;
        break;
      case cornerSquareTypes_default.extraRounded:
        drawFunction = this._drawExtraRounded;
        break;
      case cornerSquareTypes_default.dot:
      default:
        drawFunction = this._drawDot;
    }
    drawFunction.call(this, { x, y, size, context, rotation });
  }
  _rotateFigure({ x, y, size, context, rotation = 0, draw }) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    context.translate(cx, cy);
    rotation && context.rotate(rotation);
    draw();
    context.closePath();
    rotation && context.rotate(-rotation);
    context.translate(-cx, -cy);
  }
  _basicDot(args) {
    const { size, context } = args;
    const dotSize = size / 7;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(0, 0, size / 2, 0, Math.PI * 2);
        context.arc(0, 0, size / 2 - dotSize, 0, Math.PI * 2);
      }
    });
  }
  _basicSquare(args) {
    const { size, context } = args;
    const dotSize = size / 7;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.rect(-size / 2, -size / 2, size, size);
        context.rect(-size / 2 + dotSize, -size / 2 + dotSize, size - 2 * dotSize, size - 2 * dotSize);
      }
    });
  }
  _basicExtraRounded(args) {
    const { size, context } = args;
    const dotSize = size / 7;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(-dotSize, -dotSize, 2.5 * dotSize, Math.PI, -Math.PI / 2);
        context.lineTo(dotSize, -3.5 * dotSize);
        context.arc(dotSize, -dotSize, 2.5 * dotSize, -Math.PI / 2, 0);
        context.lineTo(3.5 * dotSize, -dotSize);
        context.arc(dotSize, dotSize, 2.5 * dotSize, 0, Math.PI / 2);
        context.lineTo(-dotSize, 3.5 * dotSize);
        context.arc(-dotSize, dotSize, 2.5 * dotSize, Math.PI / 2, Math.PI);
        context.lineTo(-3.5 * dotSize, -dotSize);
        context.arc(-dotSize, -dotSize, 1.5 * dotSize, Math.PI, -Math.PI / 2);
        context.lineTo(dotSize, -2.5 * dotSize);
        context.arc(dotSize, -dotSize, 1.5 * dotSize, -Math.PI / 2, 0);
        context.lineTo(2.5 * dotSize, -dotSize);
        context.arc(dotSize, dotSize, 1.5 * dotSize, 0, Math.PI / 2);
        context.lineTo(-dotSize, 2.5 * dotSize);
        context.arc(-dotSize, dotSize, 1.5 * dotSize, Math.PI / 2, Math.PI);
        context.lineTo(-2.5 * dotSize, -dotSize);
      }
    });
  }
  _drawDot({ x, y, size, context, rotation }) {
    this._basicDot({ x, y, size, context, rotation });
  }
  _drawSquare({ x, y, size, context, rotation }) {
    this._basicSquare({ x, y, size, context, rotation });
  }
  _drawExtraRounded({ x, y, size, context, rotation }) {
    this._basicExtraRounded({ x, y, size, context, rotation });
  }
};

// src/constants/cornerDotTypes.ts
var cornerDotTypes_default = {
  dot: "dot",
  square: "square"
};

// src/figures/cornerDot/QRCornerDot.ts
var QRCornerDot = class {
  constructor({ context, type }) {
    this._context = context;
    this._type = type;
  }
  draw(x, y, size, rotation) {
    const context = this._context;
    const type = this._type;
    let drawFunction;
    switch (type) {
      case cornerDotTypes_default.square:
        drawFunction = this._drawSquare;
        break;
      case cornerDotTypes_default.dot:
      default:
        drawFunction = this._drawDot;
    }
    drawFunction.call(this, { x, y, size, context, rotation });
  }
  _rotateFigure({ x, y, size, context, rotation = 0, draw }) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    context.translate(cx, cy);
    rotation && context.rotate(rotation);
    draw();
    context.closePath();
    rotation && context.rotate(-rotation);
    context.translate(-cx, -cy);
  }
  _basicDot(args) {
    const { size, context } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.arc(0, 0, size / 2, 0, Math.PI * 2);
      }
    });
  }
  _basicSquare(args) {
    const { size, context } = args;
    this._rotateFigure({
      ...args,
      draw: () => {
        context.rect(-size / 2, -size / 2, size, size);
      }
    });
  }
  _drawDot({ x, y, size, context, rotation }) {
    this._basicDot({ x, y, size, context, rotation });
  }
  _drawSquare({ x, y, size, context, rotation }) {
    this._basicSquare({ x, y, size, context, rotation });
  }
};

// src/constants/qrTypes.ts
var qrTypes = {};
for (let type = 0; type <= 40; type++) {
  qrTypes[type] = type;
}
var qrTypes_default = qrTypes;

// src/constants/errorCorrectionLevels.ts
var errorCorrectionLevels_default = {
  L: "L",
  M: "M",
  Q: "Q",
  H: "H"
};

// src/core/QROptions.ts
var defaultOptions = {
  width: 300,
  height: 300,
  data: "",
  margin: 0,
  qrOptions: {
    typeNumber: qrTypes_default[0],
    mode: void 0,
    errorCorrectionLevel: errorCorrectionLevels_default.Q
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.4,
    margin: 0
  },
  dotsOptions: {
    type: "square",
    color: "#000"
  },
  backgroundOptions: {
    color: "#fff"
  }
};
var QROptions_default = defaultOptions;

// src/constants/gradientTypes.ts
var gradientTypes_default = {
  radial: "radial",
  linear: "linear"
};

// src/constants/modes.ts
var modes_default = {
  numeric: "Numeric",
  alphanumeric: "Alphanumeric",
  byte: "Byte",
  kanji: "Kanji"
};

// src/tools/getMode.ts
function getMode(data) {
  switch (true) {
    case /^[0-9]*$/.test(data):
      return modes_default.numeric;
    case /^[0-9A-Z $%*+\-./:]*$/.test(data):
      return modes_default.alphanumeric;
    default:
      return modes_default.byte;
  }
}

// src/core/QRCanvas.ts
import { Canvas, loadImage } from "skia-canvas";
import qrcode from "qrcode-generator";
import { promises as fs } from "fs";

// src/tools/merge.ts
var isObject = (obj) => !!obj && typeof obj === "object" && !Array.isArray(obj);
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();
  if (source === void 0 || !isObject(target) || !isObject(source)) return target;
  target = { ...target };
  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];
    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = sourceValue;
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });
  return mergeDeep(target, ...sources);
}

// src/tools/sanitizeOptions.ts
function sanitizeGradient(gradient) {
  const newGradient = { ...gradient };
  if (!newGradient.colorStops || !newGradient.colorStops.length) {
    throw "Field 'colorStops' is required in gradient";
  }
  if (newGradient.rotation) {
    newGradient.rotation = Number(newGradient.rotation);
  } else {
    newGradient.rotation = 0;
  }
  newGradient.colorStops = newGradient.colorStops.map((colorStop) => ({
    ...colorStop,
    offset: Number(colorStop.offset)
  }));
  return newGradient;
}
function sanitizeOptions(options) {
  const newOptions = { ...options };
  newOptions.width = Number(newOptions.width);
  newOptions.height = Number(newOptions.height);
  newOptions.margin = Number(newOptions.margin);
  newOptions.imageOptions = {
    ...newOptions.imageOptions,
    hideBackgroundDots: Boolean(newOptions.imageOptions.hideBackgroundDots),
    imageSize: Number(newOptions.imageOptions.imageSize),
    margin: Number(newOptions.imageOptions.margin)
  };
  if (newOptions.margin > Math.min(newOptions.width, newOptions.height)) {
    newOptions.margin = Math.min(newOptions.width, newOptions.height);
  }
  newOptions.dotsOptions = {
    ...newOptions.dotsOptions
  };
  if (newOptions.dotsOptions.gradient) {
    newOptions.dotsOptions.gradient = sanitizeGradient(newOptions.dotsOptions.gradient);
  }
  if (newOptions.cornersSquareOptions) {
    newOptions.cornersSquareOptions = {
      ...newOptions.cornersSquareOptions
    };
    if (newOptions.cornersSquareOptions.gradient) {
      newOptions.cornersSquareOptions.gradient = sanitizeGradient(newOptions.cornersSquareOptions.gradient);
    }
  }
  if (newOptions.cornersDotOptions) {
    newOptions.cornersDotOptions = {
      ...newOptions.cornersDotOptions
    };
    if (newOptions.cornersDotOptions.gradient) {
      newOptions.cornersDotOptions.gradient = sanitizeGradient(newOptions.cornersDotOptions.gradient);
    }
  }
  if (newOptions.backgroundOptions) {
    newOptions.backgroundOptions = {
      ...newOptions.backgroundOptions
    };
    if (newOptions.backgroundOptions.gradient) {
      newOptions.backgroundOptions.gradient = sanitizeGradient(newOptions.backgroundOptions.gradient);
    }
  }
  return newOptions;
}

// src/core/QRCanvas.ts
var squareMask = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];
var dotMask = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
];
var QRCanvas = class {
  //TODO don't pass all options to this class
  constructor(options) {
    const mergedOptions = sanitizeOptions(mergeDeep(QROptions_default, options));
    this._width = mergedOptions.width;
    this._height = mergedOptions.height;
    this._canvas = new Canvas(this._width, this._height);
    this._options = mergedOptions;
    this._qr = qrcode(
      this._options.qrOptions.typeNumber,
      this._options.qrOptions.errorCorrectionLevel
    );
    this._qr.addData(this._options.data, this._options.qrOptions.mode || getMode(this._options.data));
    this.created = this.drawQR();
  }
  get context() {
    return this._canvas.getContext("2d");
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
  clear() {
    const canvasContext = this.context;
    if (canvasContext) {
      canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
  }
  async drawQR() {
    this._qr.make();
    const count = this._qr.getModuleCount();
    const minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2;
    const dotSize = Math.floor(minSize / count);
    let drawImageSize = {
      hideXDots: 0,
      hideYDots: 0,
      width: 0,
      height: 0
    };
    if (this._options.image !== void 0) {
      if (typeof this._options.image === "string" || Buffer.isBuffer(this._options.image)) {
        this._image = await loadImage(this._options.image);
      } else {
        this._image = this._options.image;
      }
      const { imageOptions, qrOptions } = this._options;
      const coverLevel = imageOptions.imageSize * errorCorrectionPercents_default[qrOptions.errorCorrectionLevel];
      const maxHiddenDots = Math.floor(coverLevel * count * count);
      drawImageSize = calculateImageSize({
        originalWidth: this._image.width,
        originalHeight: this._image.height,
        maxHiddenDots,
        maxHiddenAxisDots: count - 14,
        dotSize
      });
    }
    this.clear();
    this.drawBackground();
    this.drawDots((j, i) => {
      if (this._options.imageOptions.hideBackgroundDots) {
        if (i >= (count - drawImageSize.hideXDots) / 2 && i < (count + drawImageSize.hideXDots) / 2 && j >= (count - drawImageSize.hideYDots) / 2 && j < (count + drawImageSize.hideYDots) / 2) {
          return false;
        }
      }
      if (squareMask[i]?.[j] || squareMask[i - count + 7]?.[j] || squareMask[i]?.[j - count + 7]) {
        return false;
      }
      if (dotMask[i]?.[j] || dotMask[i - count + 7]?.[j] || dotMask[i]?.[j - count + 7]) {
        return false;
      }
      return true;
    });
    this.drawCorners();
    if (this._options.image !== void 0) {
      this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize });
    }
  }
  drawBackground() {
    const canvasContext = this.context;
    const options = this._options;
    if (canvasContext) {
      if (options.backgroundOptions.gradient) {
        const gradientOptions = options.backgroundOptions.gradient;
        const gradient = this._createGradient({
          context: canvasContext,
          options: gradientOptions,
          additionalRotation: 0,
          x: 0,
          y: 0,
          size: this._canvas.width > this._canvas.height ? this._canvas.width : this._canvas.height
        });
        gradientOptions.colorStops.forEach(({ offset, color }) => {
          gradient.addColorStop(offset, color);
        });
        canvasContext.fillStyle = gradient;
      } else if (options.backgroundOptions.color) {
        canvasContext.fillStyle = options.backgroundOptions.color;
      }
      canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
  }
  drawDots(filter) {
    if (!this._qr) {
      throw "QR code is not defined";
    }
    const canvasContext = this.context;
    if (!canvasContext) {
      throw "QR code is not defined";
    }
    const options = this._options;
    const count = this._qr.getModuleCount();
    if (count > options.width || count > options.height) {
      throw "The canvas is too small.";
    }
    const minSize = Math.min(options.width, options.height) - options.margin * 2;
    const dotSize = Math.floor(minSize / count);
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);
    const dot = new QRDot({ context: canvasContext, type: options.dotsOptions.type });
    canvasContext.beginPath();
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        if (filter && !filter(i, j)) {
          continue;
        }
        if (!this._qr.isDark(i, j)) {
          continue;
        }
        const x = yBeginning + j * dotSize;
        const y = xBeginning + i * dotSize;
        dot.draw(x, y, dotSize, (xOffset, yOffset) => {
          if (j + xOffset < 0 || i + yOffset < 0 || j + xOffset >= count || i + yOffset >= count) return false;
          if (filter && !filter(j + xOffset, i + yOffset)) return false;
          return !!this._qr && this._qr.isDark(i + yOffset, j + xOffset);
        });
      }
    }
    if (options.dotsOptions.gradient) {
      const gradientOptions = options.dotsOptions.gradient;
      const gradient = this._createGradient({
        context: canvasContext,
        options: gradientOptions,
        additionalRotation: 0,
        x: xBeginning,
        y: yBeginning,
        size: count * dotSize
      });
      gradientOptions.colorStops.forEach(({ offset, color }) => {
        gradient.addColorStop(offset, color);
      });
      canvasContext.fillStyle = canvasContext.strokeStyle = gradient;
    } else if (options.dotsOptions.color) {
      canvasContext.fillStyle = canvasContext.strokeStyle = options.dotsOptions.color;
    }
    canvasContext.fill("evenodd");
  }
  drawCorners(filter) {
    if (!this._qr) {
      throw "QR code is not defined";
    }
    const canvasContext = this.context;
    if (!canvasContext) {
      throw "QR code is not defined";
    }
    const options = this._options;
    const count = this._qr.getModuleCount();
    const minSize = Math.min(options.width, options.height) - options.margin * 2;
    const dotSize = Math.floor(minSize / count);
    const cornersSquareSize = dotSize * 7;
    const cornersDotSize = dotSize * 3;
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);
    [
      [0, 0, 0],
      [1, 0, Math.PI / 2],
      [0, 1, -Math.PI / 2]
    ].forEach(([column, row, rotation]) => {
      if (filter && !filter(column, row)) {
        return;
      }
      const x = xBeginning + column * dotSize * (count - 7);
      const y = yBeginning + row * dotSize * (count - 7);
      if (options.cornersSquareOptions?.type) {
        const cornersSquare = new QRCornerSquare({ context: canvasContext, type: options.cornersSquareOptions?.type });
        canvasContext.beginPath();
        cornersSquare.draw(x, y, cornersSquareSize, rotation);
      } else {
        const dot = new QRDot({ context: canvasContext, type: options.dotsOptions.type });
        canvasContext.beginPath();
        for (let i = 0; i < squareMask.length; i++) {
          for (let j = 0; j < squareMask[i].length; j++) {
            if (!squareMask[i]?.[j]) {
              continue;
            }
            dot.draw(
              x + i * dotSize,
              y + j * dotSize,
              dotSize,
              (xOffset, yOffset) => !!squareMask[i + xOffset]?.[j + yOffset]
            );
          }
        }
      }
      if (options.cornersSquareOptions?.gradient) {
        const gradientOptions = options.cornersSquareOptions.gradient;
        const gradient = this._createGradient({
          context: canvasContext,
          options: gradientOptions,
          additionalRotation: rotation,
          x,
          y,
          size: cornersSquareSize
        });
        gradientOptions.colorStops.forEach(({ offset, color }) => {
          gradient.addColorStop(offset, color);
        });
        canvasContext.fillStyle = canvasContext.strokeStyle = gradient;
      } else if (options.cornersSquareOptions?.color) {
        canvasContext.fillStyle = canvasContext.strokeStyle = options.cornersSquareOptions.color;
      }
      canvasContext.fill("evenodd");
      if (options.cornersDotOptions?.type) {
        const cornersDot = new QRCornerDot({ context: canvasContext, type: options.cornersDotOptions?.type });
        canvasContext.beginPath();
        cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);
      } else {
        const dot = new QRDot({ context: canvasContext, type: options.dotsOptions.type });
        canvasContext.beginPath();
        for (let i = 0; i < dotMask.length; i++) {
          for (let j = 0; j < dotMask[i].length; j++) {
            if (!dotMask[i]?.[j]) {
              continue;
            }
            dot.draw(
              x + i * dotSize,
              y + j * dotSize,
              dotSize,
              (xOffset, yOffset) => !!dotMask[i + xOffset]?.[j + yOffset]
            );
          }
        }
      }
      if (options.cornersDotOptions?.gradient) {
        const gradientOptions = options.cornersDotOptions.gradient;
        const gradient = this._createGradient({
          context: canvasContext,
          options: gradientOptions,
          additionalRotation: rotation,
          x: x + dotSize * 2,
          y: y + dotSize * 2,
          size: cornersDotSize
        });
        gradientOptions.colorStops.forEach(({ offset, color }) => {
          gradient.addColorStop(offset, color);
        });
        canvasContext.fillStyle = canvasContext.strokeStyle = gradient;
      } else if (options.cornersDotOptions?.color) {
        canvasContext.fillStyle = canvasContext.strokeStyle = options.cornersDotOptions.color;
      }
      canvasContext.fill("evenodd");
    });
  }
  drawImage({
    width,
    height,
    count,
    dotSize
  }) {
    const canvasContext = this.context;
    if (!canvasContext) {
      throw "canvasContext is not defined";
    }
    if (!this._image) {
      throw "image is not defined";
    }
    const options = this._options;
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);
    const dx = xBeginning + options.imageOptions.margin + (count * dotSize - width) / 2;
    const dy = yBeginning + options.imageOptions.margin + (count * dotSize - height) / 2;
    const dw = width - options.imageOptions.margin * 2;
    const dh = height - options.imageOptions.margin * 2;
    canvasContext.drawImage(this._image, dx, dy, dw < 0 ? 0 : dw, dh < 0 ? 0 : dh);
  }
  _createGradient({
    context,
    options,
    additionalRotation,
    x,
    y,
    size
  }) {
    let gradient;
    if (options.type === gradientTypes_default.radial) {
      gradient = context.createRadialGradient(x + size / 2, y + size / 2, 0, x + size / 2, y + size / 2, size / 2);
    } else {
      const rotation = ((options.rotation || 0) + additionalRotation) % (2 * Math.PI);
      const positiveRotation = (rotation + 2 * Math.PI) % (2 * Math.PI);
      let x0 = x + size / 2;
      let y0 = y + size / 2;
      let x1 = x + size / 2;
      let y1 = y + size / 2;
      if (positiveRotation >= 0 && positiveRotation <= 0.25 * Math.PI || positiveRotation > 1.75 * Math.PI && positiveRotation <= 2 * Math.PI) {
        x0 = x0 - size / 2;
        y0 = y0 - size / 2 * Math.tan(rotation);
        x1 = x1 + size / 2;
        y1 = y1 + size / 2 * Math.tan(rotation);
      } else if (positiveRotation > 0.25 * Math.PI && positiveRotation <= 0.75 * Math.PI) {
        y0 = y0 - size / 2;
        x0 = x0 - size / 2 / Math.tan(rotation);
        y1 = y1 + size / 2;
        x1 = x1 + size / 2 / Math.tan(rotation);
      } else if (positiveRotation > 0.75 * Math.PI && positiveRotation <= 1.25 * Math.PI) {
        x0 = x0 + size / 2;
        y0 = y0 + size / 2 * Math.tan(rotation);
        x1 = x1 - size / 2;
        y1 = y1 - size / 2 * Math.tan(rotation);
      } else if (positiveRotation > 1.25 * Math.PI && positiveRotation <= 1.75 * Math.PI) {
        y0 = y0 + size / 2;
        x0 = x0 + size / 2 / Math.tan(rotation);
        y1 = y1 - size / 2;
        x1 = x1 - size / 2 / Math.tan(rotation);
      }
      gradient = context.createLinearGradient(Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1));
    }
    return gradient;
  }
  /**
   * Create a buffer object with the content of the qr code
   *
   * @param format Supported types: "png" | "jpg" | "jpeg" | "pdf" | "svg"
   * @param options export options see https://github.com/samizdatco/skia-canvas#tobufferformat-page-matte-density-quality-outline
   */
  async toBuffer(format = "png", options) {
    await this.created;
    return this._canvas.toBuffer(format, options);
  }
  /**
   *  Create a data url with the content of the qr code
   *
   * @param format Supported types: "png" | "jpg" | "jpeg" | "pdf" | "svg"
   * @param options export options see https://github.com/samizdatco/skia-canvas#tobufferformat-page-matte-density-quality-outline
   */
  async toDataUrl(format = "png", options) {
    await this.created;
    return this._canvas.toDataURL(format, options);
  }
  /**
   * Create a file of the qr code and save it to disk
   *
   * @param filePath file path including extension
   * @param format Supported types: "png" | "jpg" | "jpeg" | "pdf" | "svg"
   * @param options export options see https://github.com/samizdatco/skia-canvas#tobufferformat-page-matte-density-quality-outline
   * @returns a promise that resolves once the file was written to disk
   */
  async toFile(filePath, format = "png", options) {
    await this.created;
    return fs.writeFile(filePath, await this._canvas.toBuffer(format, options));
  }
};
export {
  QRCanvas as QRCodeCanvas,
  cornerDotTypes_default as cornerDotTypes,
  cornerSquareTypes_default as cornerSquareTypes,
  dotTypes_default as dotTypes,
  errorCorrectionLevels_default as errorCorrectionLevels,
  errorCorrectionPercents_default as errorCorrectionPercents,
  modes_default as modes,
  qrTypes_default as qrTypes
};
