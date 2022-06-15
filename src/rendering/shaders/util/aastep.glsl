float aastep(float threshold, float value, float gamma) {
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold - afwidth - gamma, threshold + afwidth + gamma, value);
}