#version 300 es
precision highp float;

in vec2 pos, uv;
uniform vec2 u_texsize;
uniform mat4 u_matrix;
out vec2 v_uv;
void main() {
    gl_Position = u_matrix * vec4(pos.xy, 0, 1);
    v_uv = uv / u_texsize;
}