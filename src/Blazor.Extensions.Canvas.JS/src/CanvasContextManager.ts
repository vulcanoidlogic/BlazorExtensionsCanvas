import { v4 as uuidv4 } from "uuid";

export class ContextManager {
  private readonly contexts = new Map<string, any>();
  private readonly webGLObject = new Array<any>();
  private readonly contextName: string;
  private webGLContext = false;
  private readonly prototypes: any;

  private readonly patterns = new Map<string, any>();

  private readonly webGLTypes = [
    WebGLBuffer,
    WebGLShader,
    WebGLProgram,
    WebGLFramebuffer,
    WebGLRenderbuffer,
    WebGLTexture,
    WebGLUniformLocation,
  ];

  public constructor(contextName: string) {
    this.contextName = contextName;
    if (contextName === "2d")
      this.prototypes = CanvasRenderingContext2D.prototype;
    else if (contextName === "webgl" || contextName === "experimental-webgl") {
      this.prototypes = WebGLRenderingContext.prototype;
      this.webGLContext = true;
    } else throw new Error(`Invalid context name: ${contextName}`);
  }

  public add = (canvas: HTMLCanvasElement, parameters: any) => {
    if (!canvas) throw new Error("Invalid canvas.");
    if (this.contexts.get(canvas.id)) return;

    var context;
    if (parameters) context = canvas.getContext(this.contextName, parameters);
    else context = canvas.getContext(this.contextName);

    if (!context) throw new Error("Invalid context.");

    this.contexts.set(canvas.id, context);
  };

  public remove = (canvas: HTMLCanvasElement) => {
    this.contexts.delete(canvas.id);
  };

  public setProperty = (
    canvas: HTMLCanvasElement,
    property: string,
    value: any
  ) => {
    const context = this.getContext(canvas);
    this.setPropertyWithContext(context, property, value);
  };

  public getProperty = (canvas: HTMLCanvasElement, property: string) => {
    const context = this.getContext(canvas);
    return this.serialize(context[property]);
  };

  public call = (canvas: HTMLCanvasElement, method: string, args: any) => {
    const context = this.getContext(canvas);
    return this.callWithContext(context, method, args);
  };

  public callBatch = (canvas: HTMLCanvasElement, batchedCalls: any[][]) => {
    const context = this.getContext(canvas);
    for (let i = 0; i < batchedCalls.length; i++) {
      let params = batchedCalls[i].slice(2);
      if (batchedCalls[i][1]) {
        this.callWithContext(context, batchedCalls[i][0], params);
      } else {
        this.setPropertyWithContext(
          context,
          batchedCalls[i][0],
          Array.isArray(params) && params.length > 0 ? params[0] : null
        );
      }
    }
  };

  public drawImagePath2D = (
    canvas: HTMLCanvasElement,
    parameters: [string, number, number, number, number, number, number]
  ) => {
    if (!canvas) throw new Error("Invalid canvas in drawImagePath2D.");
    const context = this.contexts.get(canvas.id);
    if (!context) throw new Error("Invalid context in drawImagePath2D.");

    const path2D = new Path2D(parameters[0]);
    context.setTransform(
      parameters[1],
      parameters[2],
      parameters[3],
      parameters[4],
      parameters[5],
      parameters[6]
    );

    context.fill(path2D);
    return true;
  };

  public drawImageDefaultPath2D = (canvas: HTMLCanvasElement, path: string) => {
    if (!canvas) throw new Error("Invalid canvas in drawImagePath2D.");
    const context = this.contexts.get(canvas.id);
    if (!context) throw new Error("Invalid context in drawImagePath2D.");

    const path2D = new Path2D(path);
    context.fill(path2D);
    return true;
  };

  public drawImageBase64 = (
    canvas: HTMLCanvasElement,
    parameters: [string, number, number, number, number]
  ) => {
    // if (!canvas) throw new Error("Invalid canvas in drawImageBase64.");
    if (!canvas) return;
    const context = this.contexts.get(canvas.id);
    if (!context) throw new Error("Invalid context in drawImageBase64.");

    const base64img = parameters[0];
    var img = new Image();
    img.onload = function () {
      context.drawImage(
        img,
        parameters[1],
        parameters[2],
        parameters[3],
        parameters[4]
      );
    };
    img.src = base64img;
    return true;
  };

  public customRoundedRect = (
    canvas: HTMLCanvasElement,
    parameters: [number, number, number, number, number]
  ) => {
    if (!canvas) throw new Error("Invalid canvas in drawImageBase64.");
    const ctx = this.contexts.get(canvas.id);
    if (!ctx) throw new Error("Invalid context in drawImageBase64.");

    const x = parameters[0];
    const y = parameters[1];
    const width = parameters[2];
    const height = parameters[3];
    const radius = parameters[4];
    // (ctx, x, y, width, height, radius)
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    return true;
  };

  private callWithContext = (context: any, method: string, args: any) => {
    const result = this.prototypes[method].apply(
      context,
      args != undefined
        ? args.map((value) => this.deserialize(method, value))
        : []
    );

    if (method == "createPattern") {
      const key = uuidv4();
      this.patterns.set(key, result);
      return key;
    }

    return this.serialize(result);
  };

  private setPropertyWithContext = (
    context: any,
    property: string,
    value: any
  ) => {
    if (property == "fillStyle") {
      value = this.patterns.get(value) || value;
    }

    context[property] = this.deserialize(property, value);
  };

  private getContext = (canvas: HTMLCanvasElement) => {
    if (!canvas) throw new Error("Invalid canvas.");

    const context = this.contexts.get(canvas.id);
    if (!context) throw new Error("Invalid context.");

    return context;
  };

  private deserialize = (method: string, object: any) => {
    if (!this.webGLContext || object == undefined) return object; //deserialization only needs to happen for webGL

    if (object.hasOwnProperty("webGLType") && object.hasOwnProperty("id")) {
      return this.webGLObject[object["id"]];
    } else if (Array.isArray(object) && !method.endsWith("v")) {
      return Int8Array.of(...(object as number[]));
    } else if (
      typeof object === "string" &&
      (method === "bufferData" || method === "bufferSubData")
    ) {
      let binStr = window.atob(object);
      let length = binStr.length;
      let bytes = new Uint8Array(length);
      for (var i = 0; i < length; i++) {
        bytes[i] = binStr.charCodeAt(i);
      }
      return bytes;
    } else return object;
  };

  private serialize = (object: any) => {
    if (object instanceof TextMetrics) {
      return { width: object.width };
    }

    if (!this.webGLContext || object == undefined) return object; //serialization only needs to happen for webGL

    const type = this.webGLTypes.find((type) => object instanceof type);
    if (type != undefined) {
      const id = this.webGLObject.length;
      this.webGLObject.push(object);

      return {
        webGLType: type.name,
        id: id,
      };
    } else return object;
  };
}
