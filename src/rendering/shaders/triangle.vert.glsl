#version 300 es
precision highp float;

out vec4 v_pos, v_col;
out vec2 v_uv;
out vec3 v_normal;

void main() {
    float x = float((gl_VertexID & 1) << 2);
    float y = float((gl_VertexID & 2) << 1);
    v_uv.x = x * 0.5;
    v_uv.y = y * 0.5;
    gl_Position = vec4(x - 1.0, y - 1.0, 1, 1);
}