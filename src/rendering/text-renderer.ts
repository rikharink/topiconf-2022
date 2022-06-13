/*
Copyright (c) 2014, Mapbox
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of [project] nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import vert from './text.vert.glsl';
import frag from './text.frag.glsl';

import { initShaderProgram, Shader } from './gl-util';
import {
  create,
  Matrix4x4,
  multiply,
  ortho,
  rotateZ,
  translate,
} from '../math/matrix4x4';
import {
  GL_ARRAY_BUFFER,
  GL_BLEND,
  GL_CLAMP_TO_EDGE,
  GL_DATA_FLOAT,
  GL_DATA_UNSIGNED_BYTE,
  GL_LINEAR,
  GL_ONE,
  GL_ONE_MINUS_SRC_ALPHA,
  GL_RGBA,
  GL_SRC_ALPHA,
  GL_STATIC_DRAW,
  GL_TEXTURE0,
  GL_TEXTURE_2D,
  GL_TEXTURE_MAG_FILTER,
  GL_TEXTURE_MIN_FILTER,
  GL_TEXTURE_WRAP_S,
  GL_TEXTURE_WRAP_T,
  GL_TRIANGLES,
} from './gl-constants';
import settings from '../settings';
import { NormalizedRgbaColor, Radian } from '../types';

const INF = 1e20;
const SUPPORTED_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-=_+[]{}\\|;:\'",.<>/?`~ ';

interface Glyph {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  glyphWidth: number;
  glyphHeight: number;
  glyphTop: number;
  glyphLeft: number;
  glyphAdvance: number;
}

interface TinySDFSettings {
  fontSize: number;
  buffer: number;
  radius: number;
  cutoff: number;
  fontFamily: string;
  fontWeight: string | number;
  fontStyle: string;
}

type SDFDictionary = {
  [id: string]: {
    x: number;
    y: number;
    glyphWidth: number;
    glyphHeight: number;
    glyphTop: number;
    glyphLeft: number;
    glyphAdvance: number;
  };
};
type Buffer = { numItems?: number };

export interface TextRendererSettings {
  scale: number;
  halo: number;
  angle: Radian;
  gamma: number;
  textColor: NormalizedRgbaColor;
  haloColor: NormalizedRgbaColor;
}

export class TextRenderer {
  private gl: WebGL2RenderingContext;
  private tinySdf: TinySDF;

  private _shader: Shader;
  private _vertexBuffer: WebGLBuffer & Buffer;
  private _textureBuffer: WebGLBuffer & Buffer;
  private _text?: string;
  private _pMatrix: Matrix4x4;
  private _texture: WebGLTexture;
  private _dirty = true;

  public constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.tinySdf = new TinySDF();

    this._shader = initShaderProgram(gl, vert, frag)!;
    this._vertexBuffer = gl.createBuffer()!;
    this._textureBuffer = gl.createBuffer()!;
    this._text = '';
    this._pMatrix = create();
    ortho(this._pMatrix, 0, gl.canvas.width, gl.canvas.height, 0, 0, -1);
    this._texture = gl.createTexture()!;

    if (window.devicePixelRatio > 1) {
      this.gl.canvas.style.width = `${this.gl.canvas.width}px`;
      this.gl.canvas.style.height = `${this.gl.canvas.height}px`;
      this.gl.canvas.width *= 2;
      this.gl.canvas.height *= 2;
    }
  }

  public get text(): string | undefined {
    return this._text;
  }

  public set text(value: string | undefined) {
    this._dirty = true;
    this._text = value;
  }

  private _drawText(size: number) {
    if (!this.text) {
      return;
    }

    const vertexElements = [];
    const textureElements = [];

    const fontsize = this.tinySdf.fontSize;
    const buf = fontsize / 8;
    const width = this.tinySdf.glyphWidth;
    const height = this.tinySdf.glyphHeight;
    const bx = 0;
    const by = fontsize / 2 + buf;
    const scale = size / fontsize;

    const lines = this.text.split('\n');

    const base = this.tinySdf.sdfs['A'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineWidth =
        line.length * this.tinySdf.sdfs[' '].glyphAdvance * scale;
      const pen = {
        x: this.gl.canvas.width * 0.5 - lineWidth * 0.5,
        y: this.gl.canvas.height / 2 + i * fontsize * scale,
      };
      for (let i = 0; i < line.length; i++) {
        const char = line.charAt(i);
        if (char === '\n') {
          break;
        }
        const info = this.tinySdf.sdfs[char];

        if (char === ' ') {
          pen.x = pen.x + info.glyphAdvance * scale;
          continue;
        }

        const diff = (base.glyphTop - info.glyphTop) * 2;
        pen.y += diff;
        const posX = this.tinySdf.sdfs[char].x;
        const posY = this.tinySdf.sdfs[char].y;

        vertexElements.push(
          pen.x + (bx - buf) * scale,
          pen.y - by * scale,
          pen.x + (bx - buf + width) * scale,
          pen.y - by * scale,
          pen.x + (bx - buf) * scale,
          pen.y + (height - by) * scale,

          pen.x + (bx - buf + width) * scale,
          pen.y - by * scale,
          pen.x + (bx - buf) * scale,
          pen.y + (height - by) * scale,
          pen.x + (bx - buf + width) * scale,
          pen.y + (height - by) * scale,
        );
        pen.y -= diff;

        textureElements.push(
          posX,
          posY,
          posX + width,
          posY,
          posX,
          posY + height,
          posX + width,
          posY,
          posX,
          posY + height,
          posX + width,
          posY + height,
        );
        pen.x = pen.x + info.glyphAdvance * scale;
      }
    }

    this.gl.bindBuffer(GL_ARRAY_BUFFER, this._vertexBuffer);
    this.gl.bufferData(
      GL_ARRAY_BUFFER,
      new Float32Array(vertexElements),
      GL_STATIC_DRAW,
    );
    this._vertexBuffer.numItems = vertexElements.length / 2;

    this.gl.bindBuffer(GL_ARRAY_BUFFER, this._textureBuffer);
    this.gl.bufferData(
      GL_ARRAY_BUFFER,
      new Float32Array(textureElements),
      GL_STATIC_DRAW,
    );
    this._textureBuffer.numItems = textureElements.length / 2;
  }

  private _previousScale = settings.rendererSettings.textRendererSettings.scale;

  public render() {
    if (!this.text) {
      return;
    }
    const scale =
      settings.rendererSettings.textRendererSettings.scale *
      (window.devicePixelRatio / 2);

    if (scale != this._previousScale) {
      this._dirty = true;
    }
    this._previousScale = scale;
    const buffer = settings.rendererSettings.textRendererSettings.halo;
    const angle = settings.rendererSettings.textRendererSettings.angle;
    const gamma = settings.rendererSettings.textRendererSettings.gamma;

    this.gl.useProgram(this._shader.program);
    this.gl.blendFuncSeparate(
      GL_SRC_ALPHA,
      GL_ONE_MINUS_SRC_ALPHA,
      GL_ONE,
      GL_ONE,
    );
    this.gl.enable(GL_BLEND);
    this.gl.enableVertexAttribArray(this._shader.a_pos);
    this.gl.enableVertexAttribArray(this._shader.a_texcoord);
    const sdfData = new Uint8Array(
      this.tinySdf.ctx.getImageData(
        0,
        0,
        this.tinySdf.ctx.canvas.width,
        this.tinySdf.ctx.canvas.height,
      ).data,
    );
    this.gl.bindTexture(GL_TEXTURE_2D, this._texture);
    this.gl.texImage2D(
      GL_TEXTURE_2D,
      0,
      GL_RGBA,
      this.tinySdf.ctx.canvas.width,
      this.tinySdf.ctx.canvas.height,
      0,
      GL_RGBA,
      GL_DATA_UNSIGNED_BYTE,
      sdfData,
    );
    this.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    this.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    this.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    this.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    this.gl.uniform2f(
      this._shader.u_texsize,
      this.tinySdf.ctx.canvas.width,
      this.tinySdf.ctx.canvas.height,
    );

    if (this._dirty) {
      this._drawText(scale);
      this._dirty = false;
    }

    const mvMatrix = create();
    translate(mvMatrix, mvMatrix, [
      this.gl.canvas.width / 2,
      this.gl.canvas.height / 2,
      0,
    ]);
    rotateZ(mvMatrix, mvMatrix, angle);
    translate(mvMatrix, mvMatrix, [
      -this.gl.canvas.width / 2,
      -this.gl.canvas.height / 2,
      0,
    ]);
    const mvpMatrix = create();
    multiply(mvpMatrix, this._pMatrix, mvMatrix);
    this.gl.uniformMatrix4fv(this._shader.u_matrix, false, mvpMatrix);

    this.gl.activeTexture(GL_TEXTURE0);
    this.gl.bindTexture(GL_TEXTURE_2D, this._texture);
    this.gl.uniform1i(this._shader.u_texture, 0);

    this.gl.bindBuffer(GL_ARRAY_BUFFER, this._vertexBuffer);
    this.gl.vertexAttribPointer(
      this._shader.a_pos,
      2,
      GL_DATA_FLOAT,
      false,
      0,
      0,
    );

    this.gl.bindBuffer(GL_ARRAY_BUFFER, this._textureBuffer);
    this.gl.vertexAttribPointer(
      this._shader.a_texcoord,
      2,
      GL_DATA_FLOAT,
      false,
      0,
      0,
    );

    this.gl.uniform4fv(
      this._shader.u_color,
      settings.rendererSettings.textRendererSettings.haloColor,
    );
    this.gl.uniform1f(this._shader.u_buffer, buffer);
    this.gl.drawArrays(GL_TRIANGLES, 0, this._vertexBuffer.numItems!);

    this.gl.uniform4fv(
      this._shader.u_color,
      settings.rendererSettings.textRendererSettings.textColor,
    );
    this.gl.uniform1f(this._shader.u_buffer, 0.75);
    this.gl.uniform1f(
      this._shader.u_gamma,
      (gamma * 1.4142) / settings.rendererSettings.textRendererSettings.scale,
    );
    this.gl.drawArrays(GL_TRIANGLES, 0, this._vertexBuffer.numItems!);
  }
}

class TinySDF {
  private _buffer: number;
  private _cutoff: number;
  private _radius: number;
  private _size: number;
  private _gridOuter: Float64Array;
  private _gridInner: Float64Array;
  private _f: Float64Array;
  private _z: Float64Array;
  private _v: Uint16Array;
  private _glyphCtx: CanvasRenderingContext2D;

  private _fontWeight: number | string;

  public ctx: CanvasRenderingContext2D;
  public sdfs: SDFDictionary = {};
  public fontSize: number;
  public glyphWidth: number;
  public glyphHeight: number;

  constructor({
    fontSize = 24,
    buffer = 3,
    radius = 8,
    cutoff = 0.25,
    fontFamily = 'monospace',
    fontWeight = 'normal',
    fontStyle = 'normal',
  }: Partial<TinySDFSettings> = {}) {
    this._buffer = buffer;
    this._cutoff = cutoff;
    this._radius = radius;
    this.fontSize = fontSize;
    this._fontWeight = fontWeight;

    // make the canvas size big enough to both have the specified buffer around the glyph
    // for "halo", and account for some glyphs possibly being larger than their font size
    const size = (this._size = fontSize + buffer * 4);
    this.glyphWidth = this.glyphHeight = fontSize + buffer;
    const canvas = this._createCanvas(size);
    const glyphCtx = (this._glyphCtx = canvas.getContext('2d', {
      willReadFrequently: true,
    })!);
    glyphCtx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    glyphCtx.textBaseline = 'alphabetic';
    glyphCtx.textAlign = 'left'; // Necessary so that RTL text doesn't have different alignment
    glyphCtx.fillStyle = 'black';

    const canvas2 = document.createElement('canvas');
    const totalWidth = glyphCtx.canvas.width * SUPPORTED_CHARS.length;
    const rows = Math.ceil(totalWidth / 1000);
    canvas2.width = settings.rendererSettings.resolution[0];
    canvas2.height = glyphCtx.canvas.height * rows;
    this.ctx = canvas2.getContext('2d', {
      willReadFrequently: true,
    })!;

    // temporary arrays for the distance transform
    this._gridOuter = new Float64Array(size * size);
    this._gridInner = new Float64Array(size * size);
    this._f = new Float64Array(size);
    this._z = new Float64Array(size + 1);
    this._v = new Uint16Array(size);

    this._updateSDF();
  }

  private _createCanvas(size: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    return canvas;
  }

  private _makeRGBAImageData(
    alphaChannel: Uint8ClampedArray,
    width: number,
    height: number,
  ): ImageData {
    const imageData = this._glyphCtx.createImageData(width, height);
    for (let i = 0; i < alphaChannel.length; i++) {
      imageData.data[4 * i + 0] = alphaChannel[i];
      imageData.data[4 * i + 1] = alphaChannel[i];
      imageData.data[4 * i + 2] = alphaChannel[i];
      imageData.data[4 * i + 3] = 255;
    }
    return imageData;
  }

  private _updateSDF() {
    const size = this.fontSize + this._buffer * 2;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    let i = 0;
    for (
      let y = 0;
      y + size <= this.ctx.canvas.height && i < SUPPORTED_CHARS.length;
      y += size
    ) {
      for (
        let x = 0;
        x + size <= this.ctx.canvas.width && i < SUPPORTED_CHARS.length;
        x += size
      ) {
        const {
          data,
          width,
          height,
          glyphWidth,
          glyphHeight,
          glyphTop,
          glyphLeft,
          glyphAdvance,
        } = this.drawGlyph(SUPPORTED_CHARS[i]);
        this.ctx.putImageData(
          this._makeRGBAImageData(data, width, height),
          x,
          y,
        );
        this.sdfs[SUPPORTED_CHARS[i]] = {
          x,
          y,
          glyphWidth,
          glyphHeight,
          glyphTop,
          glyphLeft,
          glyphAdvance,
        };
        i++;
      }
    }
  }

  public drawGlyph(char: string): Glyph {
    const {
      width: glyphAdvance,
      actualBoundingBoxAscent,
      actualBoundingBoxDescent,
      actualBoundingBoxLeft,
      actualBoundingBoxRight,
    } = this._glyphCtx.measureText(char);

    // The integer/pixel part of the top alignment is encoded in metrics.glyphTop
    // The remainder is implicitly encoded in the rasterization
    const glyphTop = Math.ceil(actualBoundingBoxAscent);
    const glyphLeft = 0;

    // If the glyph overflows the canvas size, it will be clipped at the bottom/right
    const glyphWidth = Math.min(
      this._size - this._buffer,
      Math.ceil(actualBoundingBoxRight - actualBoundingBoxLeft),
    );
    const glyphHeight = Math.min(
      this._size - this._buffer,
      glyphTop + Math.ceil(actualBoundingBoxDescent),
    );

    const width = glyphWidth + 2 * this._buffer;
    const height = glyphHeight + 2 * this._buffer;

    const len = Math.max(width * height, 0);
    const data = new Uint8ClampedArray(len);
    const glyph = {
      data,
      width,
      height,
      glyphWidth,
      glyphHeight,
      glyphTop,
      glyphLeft,
      glyphAdvance,
    };
    if (glyphWidth === 0 || glyphHeight === 0) return glyph;

    const {
      _glyphCtx: ctx,
      _buffer: buffer,
      _gridInner: gridInner,
      _gridOuter: gridOuter,
    } = this;
    ctx.clearRect(buffer, buffer, glyphWidth, glyphHeight);
    ctx.fillText(char, buffer, buffer + glyphTop);
    const imgData = ctx.getImageData(buffer, buffer, glyphWidth, glyphHeight);

    // Initialize grids outside the glyph range to alpha 0
    gridOuter.fill(INF, 0, len);
    gridInner.fill(0, 0, len);

    for (let y = 0; y < glyphHeight; y++) {
      for (let x = 0; x < glyphWidth; x++) {
        const a = imgData.data[4 * (y * glyphWidth + x) + 3] / 255; // alpha value
        if (a === 0) continue; // empty pixels

        const j = (y + buffer) * width + x + buffer;

        if (a === 1) {
          // fully drawn pixels
          gridOuter[j] = 0;
          gridInner[j] = INF;
        } else {
          // aliased pixels
          const d = 0.5 - a;
          gridOuter[j] = d > 0 ? d * d : 0;
          gridInner[j] = d < 0 ? d * d : 0;
        }
      }
    }

    edt(gridOuter, 0, 0, width, height, width, this._f, this._v, this._z);
    edt(
      gridInner,
      buffer,
      buffer,
      glyphWidth,
      glyphHeight,
      width,
      this._f,
      this._v,
      this._z,
    );

    for (let i = 0; i < len; i++) {
      const d = Math.sqrt(gridOuter[i]) - Math.sqrt(gridInner[i]);
      data[i] = Math.round(255 - 255 * (d / this._radius + this._cutoff));
    }

    return glyph;
  }
}

// 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
function edt(
  data: Float64Array,
  x0: number,
  y0: number,
  width: number,
  height: number,
  gridSize: number,
  f: Float64Array,
  v: Uint16Array,
  z: Float64Array,
): void {
  for (let x = x0; x < x0 + width; x++)
    edt1d(data, y0 * gridSize + x, gridSize, height, f, v, z);
  for (let y = y0; y < y0 + height; y++)
    edt1d(data, y * gridSize + x0, 1, width, f, v, z);
}

// 1D squared distance transform
function edt1d(
  grid: Float64Array,
  offset: number,
  stride: number,
  length: number,
  f: Float64Array,
  v: Uint16Array,
  z: Float64Array,
): void {
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  f[0] = grid[offset];

  for (let q = 1, k = 0, s = 0; q < length; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);

    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }

  for (let q = 0, k = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    const qr = q - r;
    grid[offset + q * stride] = f[r] + qr * qr;
  }
}
