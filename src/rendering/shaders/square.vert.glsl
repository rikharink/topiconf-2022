#version 300 es
precision highp float;

in vec2 pos;

uniform mat3 u_t;

out vec2 v_uv;
out vec4 v_col;

void main() {
    gl_Position = vec4(u_t * vec3(pos, 1), 1);
    v_uv = pos.xy;
}