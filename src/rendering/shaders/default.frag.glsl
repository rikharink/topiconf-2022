#version 300 es
precision highp float;
in vec4 v_pos, v_col;
in vec2 v_uv;
in vec3 v_normal;
uniform float u_mix;
uniform sampler2D sampler;
out vec4 c;

void main() {
    c = mix(texture(sampler, v_uv), v_col, u_mix);
}