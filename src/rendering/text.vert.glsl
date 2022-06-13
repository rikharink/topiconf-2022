#version 300 es
precision highp float;

in vec2 a_pos, a_texcoord;
uniform vec2 u_texsize;
uniform mat4 u_matrix;
out vec2 v_texcoord;
void main() {
    gl_Position = u_matrix * vec4(a_pos.xy, 0, 1);
    v_texcoord = a_texcoord / u_texsize;
}