#define GEOMETRY_TYPE_SPHERE 0
#define GEOMETRY_TYPE_PLANE 1
#define GEOMETRY_TYPE_TRIANGLE 2

int getObjectGeometryType(int objectID)
{
    if (doesObjectHaveAttributeScalar(objectID, ATTRIBUTE_RADIUS))
    {
        return GEOMETRY_TYPE_SPHERE;
    }

    if (doesObjectHaveAttributeVectorMutable(objectID, ATTRIBUTE_NORMAL))
    {
        return GEOMETRY_TYPE_PLANE;
    }

    if (doesObjectHaveAttributeVectorMutable(objectID, ATTRIBUTE_TRIANGLE_P0))
    {
        return GEOMETRY_TYPE_TRIANGLE;
    }

    return -1;
}

vec4 getNormalAt(vec4 p, int pObjectID)
{
    switch (getObjectGeometryType(pObjectID)) {
        case GEOMETRY_TYPE_SPHERE:
            return getNormalAtSphere(
                p,
                getObjectAttributeVectorMutable(pObjectID, ATTRIBUTE_POSITION)
            );
        case GEOMETRY_TYPE_PLANE:
            return getNormalAtPlane(
                p,
                getObjectAttributeVectorMutable(pObjectID, ATTRIBUTE_NORMAL)
            );
        case GEOMETRY_TYPE_TRIANGLE:
            return getNormalAtTriangle(
                p,
                getObjectAttributeVectorMutable(pObjectID, ATTRIBUTE_TRIANGLE_E0),
                getObjectAttributeVectorMutable(pObjectID, ATTRIBUTE_TRIANGLE_E1)
            );
        default:
            return vec4(0, 0, 0, 0);
    }
}

float tRayIntersectsObject(vec4 rayOrigin, vec4 rayDirection, int objectID)
{
    switch (getObjectGeometryType(objectID)) {
        case GEOMETRY_TYPE_SPHERE:
            return tRayIntersectsSphere(
                rayOrigin,
                rayDirection,
                getObjectAttributeVectorMutable(objectID, ATTRIBUTE_POSITION),
                getObjectAttributeScalar(objectID, ATTRIBUTE_RADIUS)
            );
        case GEOMETRY_TYPE_PLANE:
            return tRayIntersectsPlane(
                rayOrigin,
                rayDirection,
                getObjectAttributeVectorMutable(objectID, ATTRIBUTE_POSITION),
                getObjectAttributeVectorMutable(objectID, ATTRIBUTE_NORMAL)
            );
        case GEOMETRY_TYPE_TRIANGLE:
            return tRayIntersectsTriangle(
                rayOrigin,
                rayDirection,
                getObjectAttributeVectorMutable(objectID, ATTRIBUTE_TRIANGLE_P0),
                getObjectAttributeVectorMutable(objectID, ATTRIBUTE_TRIANGLE_E0),
                getObjectAttributeVectorMutable(objectID, ATTRIBUTE_TRIANGLE_E1)
            );
        default:
            return 0.0;
    }
}

struct Ray
{
    vec4 origin;
    vec4 direction;
};

struct Hit
{
    vec4 x;
    int objectID;
};

uniform uint uRenderObject[64];
uniform int uRangeToRenderLights[2];
uniform int uRangeToRender[2];

Hit trace(Ray ray)
{
    Hit hit = Hit(vec4(0), -1);

    float tmin = 5000000.0;

    for (int objectID = uRangeToRenderLights[0]; objectID < uRangeToRenderLights[1]; objectID++)
    {
        if (uRenderObject[objectID] == uint(0)) // this is actually super efficient because all pixels share this path
        {
            continue;
        }

        float t = tRayIntersectsObject(ray.origin, ray.direction, objectID);

        if (0.0 <= t && t < tmin)
        {
            tmin = t;
            hit.objectID = objectID;
        }
    }

    // render always
    for (int objectID = 4; objectID < 4; objectID++)
    {
        if (uRenderObject[objectID] == uint(0)) // this is actually super efficient because all pixels share this path
        {
            continue;
        }

        float t = tRayIntersectsObject(ray.origin, ray.direction, objectID);

        if (0.0 <= t && t < tmin)
        {
            tmin = t;
            hit.objectID = objectID;
        }
    }

    for (int objectID = 37; objectID < 45; objectID++)
    {
        if (uRenderObject[objectID] == uint(0)) // this is actually super efficient because all pixels share this path
        {
            continue;
        }

        float t = tRayIntersectsObject(ray.origin, ray.direction, objectID);

        if (0.0 <= t && t < tmin)
        {
            tmin = t;
            hit.objectID = objectID;
        }
    }
    // render always (end)

    for (int objectID = uRangeToRender[0]; objectID < uRangeToRender[1]; objectID++)
    {
        if (uRenderObject[objectID] == uint(0)) // this is actually super efficient because all pixels share this path
        {
            continue;
        }

        float t = tRayIntersectsObject(ray.origin, ray.direction, objectID);

        if (0.0 <= t && t < tmin)
        {
            tmin = t;
            hit.objectID = objectID;
        }
    }

    hit.x = ray.origin + ray.direction * tmin;

    return hit;
}

bool isObjectALight(int objectID)
{
    return objectID < uLightCount;
}
