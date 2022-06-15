#version 300 es
precision mediump float;

in vec2 a_pos, a_uv;
uniform vec2 u_texsize;
uniform mat4 u_matrix;
out vec2 v_uv;
void main() {
    gl_Position = u_matrix * vec4(a_pos.xy, 0, 1);
    v_uv = a_uv / u_texsize;
}