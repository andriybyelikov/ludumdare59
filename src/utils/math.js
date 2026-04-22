export const scalar = {
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    mod: (x, m) => ((x % m) + m) % m,
};

export const vec3 = {
    crossProduct: function (a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    },
};

export const vec4 = {
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3],
    lengthSquared: (v) => vec4.dot(v, v),
    length: (v) => Math.sqrt(vec4.lengthSquared(v)),
    normalized: (v) =>
    {
        const invL = 1.0 / Math.sqrt(vec4.lengthSquared(v));
        return [v[0] * invL, v[1] * invL, v[2] * invL, v[3] * invL];
    },
    sum:        (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]],
    difference: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]],
    scaled: (v, s) => [v[0] * s, v[1] * s, v[2] * s, v[3] * s],
};

export const mat4 = {
    identity: () => [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ],
    translation: (t) =>
    {
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            t,
        ];
    },
    transposed: function (m) {
        return [
            [m[0][0], m[1][0], m[2][0], m[3][0]],
            [m[0][1], m[1][1], m[2][1], m[3][1]],
            [m[0][2], m[1][2], m[2][2], m[3][2]],
            [m[0][3], m[1][3], m[2][3], m[3][3]],
        ];
    },
    product: function (a, b) {
        let at = mat4.transposed(a);
        return b.map((w) => at.map((v) => vec4.dot(v, w)));
    },
    lookAt: function(eye, center, up) {
        const forward = vec4.normalized(vec4.difference(center, eye));
        const right = vec4.normalized([...vec3.crossProduct(forward, up), 0]);
        const newUp = vec4.normalized([...vec3.crossProduct(right, forward), 0]);
        const negativeForward = vec4.difference([0, 0, 0, 0], forward);

        const M = [
            right,
            newUp,
            negativeForward,
            [0, 0, 0, 1],
        ];

        // return mat4.product(mat4.transposed(M), mat4.translation(vec4.sum([0, 0, 0, 1], vec4.difference([0, 0, 0, 1], eye))));
        return mat4.product(mat4.transposed(M), mat4.translation([-eye[0], -eye[1], -eye[2], 1.0]));
    },
    pixelToRay: function(resolution, vfov) {
        const w = resolution[0];
        const h = resolution[1];
        const t = Math.tan(vfov / 2);
        return [
            [
                t * (2 / h),
                0,
                0,
            ],
            [
                0,
                t * (2 / h),
                0,
            ],
            [
                t * ((1 - w) / h),
                t * ((1 - h) / h),
                1,
            ],
        ];
    },
};
