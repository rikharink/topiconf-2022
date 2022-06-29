#version 300 es
precision highp float;

in vec4 pos, col;
in vec3 normal;
in vec2 uv;

uniform mat4 mv, p;

out vec4 v_pos, v_col;
out vec3 v_normal;
out vec2 v_uv;

void main() {
    gl_Position = p * mv * pos;
    v_pos = pos;
    v_col = col;
    v_uv = uv;
    v_normal = normal;
}