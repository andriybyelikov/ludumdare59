export const COLLISION_BOXES = [
    {
        name: "Room 1 Container",
        bounds: [
            [0.0, 0.0, 0.0, 1.0],
            [16.0, 5.0, 16.0, 1.0],
        ],
    },
    {
        name: "Room 1 Magic Corner",
        bounds: [
            [15.0, 0.0, 0.0, 1.0],
            [16.0, 5.0, 0.5, 1.0],
        ],
    },
    {
        name: "Room 1 Buried Terminal",
        bounds: [
            [4.0, 0.0, 5.0, 1.0],
            [6.0, 1.33, 7.0, 1.0],  
        ],
    },
    {
        name: "Room 1 Exit",
        bounds: [
            [15.0, 0.0, -10.0, 1.0],
            [16.0, 5.0, 0.5, 1.0],
        ],
    },
    {
        name: "Room 2 Container",
        bounds: [
            [0.0, 0.0, -16.0, 1.0],
            [16.0, 8.0, -0.5, 1.0],
        ],
    },
    {
        name: "Room 2 Ditch",
        bounds: [
            [0.0, 0.0, -12.0, 1.0],
            [16.0, 4.0, -4, 1.0],
        ],
    },
];

export function isPointInBox(p, b)
{
    const b0 = b.bounds[0];
    const b1 = b.bounds[1];

    if (! (b0[0] <= p[0] && p[0] < b1[0]))
    {
        return false;
    }

    if (! (b0[1] <= (p[1] - 1.75) && (p[1] - 1.75) < b1[1]))
    {
        return false;
    }

    if (! (b0[2] <= p[2] && p[2] < b1[2]))
    {
        return false;
    }

    return true;
}
