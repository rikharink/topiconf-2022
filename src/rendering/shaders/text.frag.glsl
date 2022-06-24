#version 300 es
precision highp float;

#include "./util/aastep.glsl"

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform float u_buffer;
uniform float u_gamma;

in vec2 v_uv;

out vec4 c;

void main() {
    float sdf = texture(u_texture, v_uv).r;
    float alpha = aastep(u_buffer, sdf, u_gamma);
    c = vec4(u_color.rgb, alpha * u_color.a);
}