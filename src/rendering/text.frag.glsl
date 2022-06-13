#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform float u_buffer;
uniform float u_gamma;

in vec2 v_texcoord;

out vec4 c;

void main() {
    float dist = texture(u_texture, v_texcoord).r;
    float alpha = smoothstep(u_buffer - u_gamma, u_buffer + u_gamma, dist);
    c  = vec4(u_color.rgb, alpha * u_color.a);
}