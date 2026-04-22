float tRayIntersectsTriangle(
    vec4 rayOrigin, vec4 rayDirection,
    vec4 p0, vec4 e0, vec4 e1)
{
    vec4 normal = vec4(cross(e0.xyz, e1.xyz), 0.0);

    float determinant = dot(rayDirection, normal);

    if (0.0 == determinant)
    {
        return -1.0;
    }

    vec4 toRayOrigin = rayOrigin - p0;

    float t = -dot(toRayOrigin, normal) / determinant;

    vec4 px = rayOrigin + rayDirection * t;

    vec4 r0 = px - p0;
    vec4 r1 = r0 - e0;
    vec4 r2 = r1 - e1;

    vec4 n0 = vec4(cross(normal.xyz, e0.xyz), 0.0);
    vec4 n1 = vec4(cross(normal.xyz, e1.xyz), 0.0);
    vec4 n2 = -(n0 + n1);

    if (min(min(dot(r0, n0), dot(r1, n1)), dot(r2, n2)) < 0.0)
    {
        return -1.0;
    }

    return t;
}

vec4 getNormalAtTriangle(vec4 p, vec4 e0, vec4 e1)
{
    return vec4(normalize(cross(e0.xyz, e1.xyz)), 0.0);
}
