#version 300 es
precision highp float;
in vec4 v_pos, v_col;
in vec2 v_uv;
in vec3 v_normal;
uniform float u_mix;
uniform sampler2D sampler;
out vec4 c;

void main() {
    //c = vec4(v_normal.r, v_normal.g, v_normal.b, 1.);
    //c = vec4(v_uv.r, v_uv.g, 0., 1.);
    c = mix(texture(sampler, v_uv), v_col, u_mix);
}