uniform sampler2D uTextureDataValuesVector;
uniform sampler2D uTextureTransformMatrices;

uniform mat4 uViewMatrix;

flat in int i;

out vec4 transformedVector;

void main()
{
    mat4 transform = mat4(
        texelFetch(uTextureTransformMatrices, ivec2(i * 4 + 0, 0), 0),
        texelFetch(uTextureTransformMatrices, ivec2(i * 4 + 1, 0), 0),
        texelFetch(uTextureTransformMatrices, ivec2(i * 4 + 2, 0), 0),
        texelFetch(uTextureTransformMatrices, ivec2(i * 4 + 3, 0), 0)
    );
    transformedVector = uViewMatrix * transform * texelFetch(uTextureDataValuesVector, ivec2(i, 0), 0);
}
