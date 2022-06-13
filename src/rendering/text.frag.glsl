#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform float u_buffer;
uniform float u_gamma;

in vec2 v_texcoord;

out vec4 c;

float aastep(float threshold, float value) {
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold - afwidth - u_gamma, threshold + afwidth + u_gamma, value);
}

void main() {
    float dist = texture(u_texture, v_texcoord).r;
    float alpha = aastep(u_buffer, dist);
    c = vec4(u_color.rgb, alpha * u_color.a);
}