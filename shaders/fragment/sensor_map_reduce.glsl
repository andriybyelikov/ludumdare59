uniform sampler2D uTextureInput;

out vec4 color;

uniform int uSearchRange[2];

void main()
{
    int l = uSearchRange[0];
    int r = uSearchRange[1];

    ivec2 base = ivec2(gl_FragCoord.xy) * 2;

    vec4 s0 = texelFetch(uTextureInput, base + ivec2(0, 0), 0);
    float f0 = s0.x * s0.y;
    int i0 = int(round(f0));
    if (l <= i0 && i0 <= r)
    {
        color = vec4(float(l), 1.0, 0.0, 0.0);
        return;
    }

    vec4 s1 = texelFetch(uTextureInput, base + ivec2(0, 1), 0);
    float f1 = s1.x * s1.y;
    int i1 = int(round(f1));
    if (l <= i1 && i1 <= r)
    {
        color = vec4(float(l), 1.0, 0.0, 0.0);
        return;
    }

    vec4 s2 = texelFetch(uTextureInput, base + ivec2(1, 0), 0);
    float f2 = s2.x * s2.y;
    int i2 = int(round(f2));
    if (l <= i2 && i2 <= r)
    {
        color = vec4(float(l), 1.0, 0.0, 0.0);
        return;
    }

    vec4 s3 = texelFetch(uTextureInput, base + ivec2(1, 1), 0);
    float f3 = s3.x * s3.y;
    int i3 = int(round(f3));
    if (l <= i3 && i3 <= r)
    {
        color = vec4(float(l), 1.0, 0.0, 0.0);
        return;
    }

    color = vec4(0.0);
}
