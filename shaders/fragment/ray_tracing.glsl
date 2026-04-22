vec4 L_e(Hit hit)
{
    if (!isObjectALight(hit.objectID))
    {
        return vec4(0.0);
    }

    vec4 rho_e = getObjectAttributeVector(hit.objectID, ATTRIBUTE_EMISSION_SPD);
    float r0_squared = getObjectAttributeScalar(hit.objectID, ATTRIBUTE_EMISSION_RANGE_SQUARED);

    return rho_e * r0_squared;
}

layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outObjectID;

vec4 L_r(Hit hit, vec4 outgoing)
{
    vec4 radiance = vec4(0.0);

    if (isObjectALight(hit.objectID))
    {
        return radiance;
    }

    vec4 rho_r = getObjectAttributeVector(hit.objectID, ATTRIBUTE_REFLECTANCE_SPD);
    float glossiness = getObjectAttributeScalar(hit.objectID, ATTRIBUTE_GLOSSINESS);
    vec4 n = getNormalAt(hit.x, hit.objectID);
    vec4 o = hit.x + n * 1e-4;
    outObjectID.y = 0.0;
    for (int lightID = uRangeToRenderLights[0]; lightID < uRangeToRenderLights[1]; lightID++)
    {
        if (uRenderObject[lightID] == uint(0)) // this is actually super efficient because all pixels share this path
        {
            continue;
        }

        vec4 y = getObjectAttributeVectorMutable(lightID, ATTRIBUTE_POSITION);
        float R = getObjectAttributeScalar(lightID, ATTRIBUTE_RADIUS);
        float r0_squared = getObjectAttributeScalar(lightID, ATTRIBUTE_EMISSION_RANGE_SQUARED);

        vec4 r = y - hit.x;
        float inv_r = inversesqrt(dot(r, r));
        float inv_r0 = inversesqrt(r0_squared);
        vec4 d = r * inv_r;
        
        float t0 = inv_r / (inv_r + 1.0);
        float solution2 = t0 * t0;

        vec4 incidentFlux = L_e(trace(Ray(o, d)));
        vec4 incidentRadiance = incidentFlux * max(dot(d, n), 0.0) * solution2;

        vec3 brdfLambert = rho_r.rgb;

        vec4 reflected = reflect(-d, n);

        float sineSquared = R * R * inv_r * inv_r;
        float cosineLimit = sqrt(1.0 - sineSquared);
        float B = cosineLimit <= max(dot(reflected, outgoing), 0.0) ? 1.0 : 0.0;
        outObjectID.y = outObjectID.y + B * glossiness > 1.0 ? 1.0 : B * glossiness;
        vec3 brdfSpecular = vec3(1.0);

        radiance += vec4(mix(incidentRadiance.rgb * brdfLambert, incidentFlux.rgb * brdfSpecular, B * glossiness), 1.0);
    }

    for (int lightID = 4; lightID < 4; lightID++)
    {
        if (uRenderObject[lightID] == uint(0)) // this is actually super efficient because all pixels share this path
        {
            continue;
        }

        vec4 y = getObjectAttributeVectorMutable(lightID, ATTRIBUTE_POSITION);
        float R = getObjectAttributeScalar(lightID, ATTRIBUTE_RADIUS);
        float r0_squared = getObjectAttributeScalar(lightID, ATTRIBUTE_EMISSION_RANGE_SQUARED);

        vec4 r = y - hit.x;
        float inv_r = inversesqrt(dot(r, r));
        float inv_r0 = inversesqrt(r0_squared);
        vec4 d = r * inv_r;
        
        float t0 = inv_r / (inv_r + 1.0);
        float solution2 = t0 * t0;

        vec4 incidentFlux = L_e(trace(Ray(o, d)));
        vec4 incidentRadiance = incidentFlux * max(dot(d, n), 0.0) * solution2;

        vec3 brdfLambert = rho_r.rgb;

        vec4 reflected = reflect(-d, n);

        float sineSquared = R * R * inv_r * inv_r;
        float cosineLimit = sqrt(1.0 - sineSquared);
        float B = cosineLimit <= max(dot(reflected, outgoing), 0.0) ? 1.0 : 0.0;
        outObjectID.y = outObjectID.y + B * glossiness > 1.0 ? 1.0 : B * glossiness;
        vec3 brdfSpecular = vec3(1.0);

        radiance += vec4(mix(incidentRadiance.rgb * brdfLambert, incidentFlux.rgb * brdfSpecular, B * glossiness), 1.0);
    }

    return vec4(radiance.rgb, 1.0);
}

vec4 L_o(Hit hit, vec4 outgoing)
{
    if (hit.objectID == -1)
    {
        return vec4(0.0);
    }

    return L_e(hit) + L_r(hit, outgoing);
}

uniform mat3 uPixelToRayTransform;

void main()
{
    vec3 p = uPixelToRayTransform * vec3(gl_FragCoord.xy, 1);
    vec4 d = vec4(normalize(vec3(p.xy, -1)), 0);
    vec4 o = vec4(0, 0, 0, 1);

    Hit hit = trace(Ray(o, d));
    
    vec4 radiance = L_o(hit, -d);

    outColor = tmReinhardLogHSV(radiance);
    outObjectID.x = float(hit.objectID);
    //outColor = tmClip(radiance);
}
