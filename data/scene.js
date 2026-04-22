import { scalar, vec4, mat4 } from '../src/utils/math.js';

const FLOOR_REFLECTANCE_SPD = [0.366, 0.282, 0.184, 1.0]; // Common Earth (Italy)

const TORCH_REFLECTANCE_SPD = [0.8, 0.6, 0.4, 1.0];
const TORCH_GLOSSINESS = 0.0;

const TORCH_FIRE_RADIUS = 5e-2;
const TORCH_FIRE_MARGIN = 1e-2;
const TORCH_FIRE_EMISSION_RANGE_SQUARED = 2.0 ** 2.0;
const TORCH_FIRE_EMISSION_SPD = [1.0, 0.57, 0.16, 1.0];

const ROOM_2_WALL_REFLECTANCE_SPD = [0.8, 0.8, 0.8, 1.0];
const ROOM_2_WALL_GLOSINESS = 1.0;
const ROOM_2_IMPASSABLE_FLOOR_REFLECTANCE_SPD = [0.1, 0.075, 0.2, 1.0];
const ROOM_2_IMPASSABLE_FLOOR_GLOSINESS = 1.0;

const WALLS_HEIGHT = 5.0;

const makeTorch = (name, position, base, height) => [
    {
        name: name,
        transform: {
            translation: mat4.translation(position),
            rotation: mat4.identity(),
        },
        children: [
            {
                name: "Torch Face N Triangle",
                triangle_p0: [+base, 0.0 + 1.0 * height, +base, 1.0],
                triangle_e0: [-2.0 * base, 0.0, 0.0, 0.0],
                triangle_e1: [base, -height, -base, 0.0],
                reflectance_spd: TORCH_REFLECTANCE_SPD,
                glossiness: TORCH_GLOSSINESS,
            },
            {
                name: "Torch Face W Triangle",
                triangle_p0: [-base, 0.0 + 1.0 * height, +base, 1.0],
                triangle_e0: [0.0, 0.0, -2.0 * base, 0.0],
                triangle_e1: [base, -height, base, 0.0],
                reflectance_spd: TORCH_REFLECTANCE_SPD,
                glossiness: TORCH_GLOSSINESS,
            },
            {
                name: "Torch Face S Triangle",
                triangle_p0: [-base, 0.0 + 1.0 * height, -base, 1.0],
                triangle_e0: [2.0 * base, 0.0, 0.0, 0.0],
                triangle_e1: [-base, -height, base, 0.0],
                reflectance_spd: TORCH_REFLECTANCE_SPD,
                glossiness: TORCH_GLOSSINESS,
            },
            {
                name: "Torch Face E Triangle",
                triangle_p0: [+base, 0.0 + 1.0 * height, -base, 1.0],
                triangle_e0: [0.0, 0.0, 2.0 * base, 0.0],
                triangle_e1: [-base, -height, -base, 0.0],
                reflectance_spd: TORCH_REFLECTANCE_SPD,
                glossiness: TORCH_GLOSSINESS,
            },
            {
                name: "Torch Face Base Triangle 0",
                triangle_p0: [-base, 0.0 + 1.0 * height, +base, 1.0],
                triangle_e0: [2.0 * base, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, -2.0 * base, 0.0],
                reflectance_spd: TORCH_REFLECTANCE_SPD,
                glossiness: TORCH_GLOSSINESS,
            },
            {
                name: "Torch Face Base Triangle 1",
                triangle_p0: [+base, 0.0 + 1.0 * height, -base, 1.0],
                triangle_e0: [-2.0 * base, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, 2.0 * base, 0.0],
                reflectance_spd: TORCH_REFLECTANCE_SPD,
                glossiness: TORCH_GLOSSINESS,
            },
            {
                name: "Torch Fire",
                position: [0.0, height + TORCH_FIRE_MARGIN + TORCH_FIRE_RADIUS, 0.0, 1.0],
                radius: TORCH_FIRE_RADIUS,
                emission_spd: TORCH_FIRE_EMISSION_SPD,
                emission_range_squared: TORCH_FIRE_EMISSION_RANGE_SQUARED,
            },
        ],
    },
];

const makeHint = (name, position, reflectance_spd) => [
    {
        name: name,
        transform: {
            translation: mat4.translation(position),
            rotation: mat4.identity(),
        },
        children: [
            {
                name: "Triangle 0",
                transform: {
                    translation: mat4.identity(),
                    rotation: mat4.identity(),
                },
                triangle_p0: [-0.25, 0.0, 0.25, 1.0],
                triangle_e0: [0.5, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, -0.5, 0.0],
                reflectance_spd: reflectance_spd,
                glossiness: 0.0,
            },
            {
                name: "Triangle 1",
                transform: {
                    translation: mat4.identity(),
                    rotation: mat4.identity(),
                },
                triangle_p0: [0.25, 0.0, -0.25, 1.0],
                triangle_e0: [-0.5, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, 0.5, 0.0],
                reflectance_spd: reflectance_spd,
                glossiness: 0.0,
            },
        ],
    },
];

export const SCENE = {
    root: {
        name: "Root",
        children: [
            // #region Room 1
            // #region Static Geometry
            // #region Architecture
            // #region Floor
            {
                name: "Floor - Triangle 0",
                triangle_p0: [0.0, 0.0, 16.0, 1.0],
                triangle_e0: [16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, -16.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 0.0,
            },
            {
                name: "Floor - Triangle 1",
                triangle_p0: [16.0, 0.0, 0.0, 1.0],
                triangle_e0: [-16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, 16.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 0.0,
            },
            // #endregion
            // #region North Wall
            {
                name: "North Wall W - Triangle 0",
                triangle_p0: [0.0, 0.0, 0.0, 1.0],
                triangle_e0: [15.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 2.0 * WALLS_HEIGHT, 0.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 0.0,
            },
            {
                name: "North Wall W - Triangle 1",
                triangle_p0: [15.0, 2.0 * WALLS_HEIGHT, 0.0, 1.0],
                triangle_e0: [-15.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, -2.0 * WALLS_HEIGHT, 0.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 0.0,
            },
            {
                name: "North Wall - Triangle 0 - Trick",
                triangle_p0: [15.0, 0.0, 1e-2, 1.0],
                triangle_e0: [1.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 2.0 * WALLS_HEIGHT, 0.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 1.0,
            },
            {
                name: "North Wall - Triangle 1 - Trick",
                triangle_p0: [16.0, 2.0 * WALLS_HEIGHT, 1e-2, 1.0],
                triangle_e0: [-1.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, -2.0 * WALLS_HEIGHT, 0.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 1.0,
            },
            // #endregion
            // #region West Wall
            {
                name: "West Wall - Triangle 0",
                triangle_p0: [0.0, 0.0, 16.0, 1],
                triangle_e0: [0.0, 0.0, -16.0, 0.0],
                triangle_e1: [0.0, WALLS_HEIGHT, 0.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 0.0,
            },
            {
                name: "West Wall - Triangle 1",
                triangle_p0: [0.0, WALLS_HEIGHT, 0.0, 1.0],
                triangle_e0: [0.0, 0.0, 16.0, 0.0],
                triangle_e1: [0.0, -WALLS_HEIGHT, 0.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 0.0,
            },
            // #endregion
            // #region South Wall
            {
                name: "South Wall - Triangle 0",
                triangle_p0: [16.0, 0.0, 16.0, 1.0],
                triangle_e0: [-16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, WALLS_HEIGHT, 0.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 0.0,
            },
            {
                name: "South Wall - Triangle 1",
                triangle_p0: [0.0, WALLS_HEIGHT, 16.0, 1.0],
                triangle_e0: [16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, -WALLS_HEIGHT, 0.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 0.0,
            },
            // #endregion
            // #region East Wall
            {
                name: "East Wall - Triangle 0",
                triangle_p0: [16.0, 0.0, 0.0, 1.0],
                triangle_e0: [0.0, 0.0, 16.0, 0.0],
                triangle_e1: [0.0, WALLS_HEIGHT, 0.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 0.0,
            },
            {
                name: "East Wall - Triangle 1",
                triangle_p0: [16.0, WALLS_HEIGHT, 16.0, 1.0],
                triangle_e0: [0.0, 0.0, -16.0, 0.0],
                triangle_e1: [0.0, -WALLS_HEIGHT, 0.0, 0.0],
                reflectance_spd: FLOOR_REFLECTANCE_SPD,
                glossiness: 0.0,
            },
            // #endregion
            // #region Ceiling
            // {
            //     name: "Ceiling - Triangle 0",
            //     triangle_p0: [0.0, WALLS_HEIGHT, 0.0, 1.0],
            //     triangle_e0: [16.0, 0.0, 0.0, 0.0],
            //     triangle_e1: [0.0, 0.0, 16.0, 0.0],
            //     reflectance_spd: FLOOR_REFLECTANCE_SPD,
            //     glossiness: 0.0,
            // },
            // {
            //     name: "Ceiling - Triangle 1",
            //     triangle_p0: [16.0, WALLS_HEIGHT, 16.0, 1.0],
            //     triangle_e0: [-16.0, 0.0, 0.0, 0.0],
            //     triangle_e1: [0.0, 0.0, -16.0, 0.0],
            //     reflectance_spd: FLOOR_REFLECTANCE_SPD,
            //     glossiness: 0.0,
            // },
            // #endregion
            // #endregion
            // #region Objects
            {
                name: "Buried Terminal",
                position: [5.0, 0.33, 6.0, 1.0],
                reflectance_spd: [0.7, 0.7, 0.7, 1.0], // FLOOR_REFLECTANCE_SPD,
                radius: 1.0,
                glossiness: 1.0,
            },
            {
                name: "Grass Strand 0",
                triangle_p0: [5.0, 0.0, 7.5, 1.0],
                triangle_e0: [0.05, 0.0, 0.0, 0.0],
                triangle_e1: [0.05, 0.75, 0.0, 0.0],
                reflectance_spd: [0.1, 1.0, 0.0, 1.0],
                glossiness: 0.0,
            },
            {
                name: "Grass Strand 1",
                triangle_p0: [4.95, 0.0, 7.45, 1.0],
                triangle_e0: [0.05, 0.0, 0.0, 0.0],
                triangle_e1: [-0.05, 0.5, 0.0, 0.0],
                reflectance_spd: [0.1, 1.0, 0.0, 1.0],
                glossiness: 0.0,
            },
            {
                name: "Fire Light",
                position: [4.0, 0.0 + 1e-1 * 3.0, 9.0, 1.0],
                radius: 1e-1,
                emission_spd: [1.0, 0.57, 0.16, 1.0],
                emission_range_squared: 4.0 ** 2.0,
            },
            {
                name: "Moon",
                position: [0.0, 500.0, 0.0, 1.0],
                radius: 20.0,
                emission_spd: [0.5, 0.5, 0.5, 1.0],
                emission_range_squared: 100.0 ** 2.0,
            },
            {
                name: "Moon Occluder",
                position: [0.0, 460.0, 1.0, 1.0],
                radius: 22.0,
                reflectance_spd: [0.0, 0.0, 0.0, 1.0],
                emission_range_squared: 1.0 ** 2.0,
            },
            {
                name: "Sky Plane",
                position: [0.0, 510.0, 0.0, 1.0],
                normal: [0.0, -1.0, 0.0, 0.0],
                reflectance_spd: [0.1, 0.1, 0.2, 1.0],
                glossiness: 0.0,
            },
            ...makeTorch("Torch W", [4.0 + 0.5, 0.0, 0.5, 1.0], 0.05, 1.25),
            ...makeTorch("Torch E", [12.0 - 0.5, 0.0, 0.5, 1.0], 0.05, 1.25),
            ...makeHint("Room 1 Hint", [5.5, 10e-3, 9.0, 1.0], [0.8, 0.8, 0.8, 1.0]),
            // #endregion
            // #endregion
            // #region Dynamic Geometry
            {
                name: "Camera",
                transform: {
                    translation: mat4.translation([1.0, 100.75, 15.0, 1.0]),
                    // translation: mat4.translation([15.0, 1.75, -1.0, 1.0]),
                    rotation: mat4.identity(),
                },
                children: [
                    ...makeTorch("Held Torch", [0.33, -1.75 + 0.5, -0.5, 1.0], 0.05, 1.25),
                    {
                        name: "Player Shadow - Head",
                        triangle_p0: [0.0, -1.75, 1e-1, 1.0],
                        triangle_e0: [0.5, 1.75, 0.0, 0.0],
                        triangle_e1: [-1.0, 0.0, 0.0, 0.0],
                        reflectance_spd: [0.0, 0.0, 0.0, 1.0],
                        glossiness: 0.0,
                    },
                    {
                        name: "Player Shadow - Body",
                        triangle_p0: [0.0, 0.5 - 1e-1, 1e-1, 1.0],
                        triangle_e0: [0.3, -0.5, 0.0, 0.0],
                        triangle_e1: [-0.6, 0.0, 0.0, 0.0],
                        reflectance_spd: [0.0, 0.0, 0.0, 1.0],
                        glossiness: 0.0,
                    },
                ],
            },
            // #endregion
            // #endregion
            // #region Room 2
            // {
            //     name: "Test Floor",
            //     position: [0.0, 0.0, 0.0, 1.0],
            //     normal: [0.0, 1.0, 0.0, 0.0],
            //     reflectance_spd: [0.6, 0.6, 0.8, 1.0],
            //     glossiness: 1.0,
            // },
            {
                name: "Room 2 Light",
                position: [8.0, 7.0, -8.0, 1.0],
                radius: 0.5,
                emission_spd: [0.9, 0.9, 1.0, 1.0],
                emission_range_squared: 16.0 ** 2.0,
            },
            {
                name: "Room 2 Wall N Triangle 0",
                triangle_p0: [0.0, 0.0, -16.0, 1.0],
                triangle_e0: [16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 8.0, 0.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall N Triangle 1",
                triangle_p0: [16.0, 8.0, -16.0, 1.0],
                triangle_e0: [-16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, -8.0, 0.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall E Triangle 0",
                triangle_p0: [0.0, 0.0, 0.0, 1.0],
                triangle_e0: [0.0, 0.0, -16.0, 0.0],
                triangle_e1: [0.0, 8.0, 0.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall W Triangle 1",
                triangle_p0: [0.0, 8.0, -16.0, 1.0],
                triangle_e0: [0.0, 0.0, 16.0, 0.0],
                triangle_e1: [0.0, -8.0, 0.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall W Triangle 0",
                triangle_p0: [16.0, 0.0, 0.0, 1.0],
                triangle_e0: [-16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 8.0, 0.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall S Triangle 1",
                triangle_p0: [0.0, 8.0, 0.0, 1.0],
                triangle_e0: [16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, -8.0, 0.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall E Triangle 0",
                triangle_p0: [16.0, 0.0, -16.0, 1.0],
                triangle_e0: [0.0, 0.0, 16.0, 0.0],
                triangle_e1: [0.0, 8.0, 0.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall E Triangle 1",
                triangle_p0: [16.0, 8.0, 0.0, 1.0],
                triangle_e0: [0.0, 0.0, -16.0, 0.0],
                triangle_e1: [0.0, -8.0, 0.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall Floor S Triangle 0",
                triangle_p0: [0.0, 0.0, 0.0, 1.0],
                triangle_e0: [16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, -4.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall Floor S Triangle 1",
                triangle_p0: [16.0, 0.0, -4.0, 1.0],
                triangle_e0: [-16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, 4.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall Floor M Triangle 0",
                triangle_p0: [0.0, -2.0, -4.0, 1.0],
                triangle_e0: [16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, -8.0, 0.0],
                reflectance_spd: ROOM_2_IMPASSABLE_FLOOR_REFLECTANCE_SPD,
                glossiness: ROOM_2_IMPASSABLE_FLOOR_GLOSINESS,
            },
            {
                name: "Room 2 Wall Floor M Triangle 1",
                triangle_p0: [16.0, -2.0, -12.0, 1.0],
                triangle_e0: [-16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, 8.0, 0.0],
                reflectance_spd: ROOM_2_IMPASSABLE_FLOOR_REFLECTANCE_SPD,
                glossiness: ROOM_2_IMPASSABLE_FLOOR_GLOSINESS,
            },
            {
                name: "Room 2 Wall Floor N Triangle 0",
                triangle_p0: [0.0, 0.0, -12.0, 1.0],
                triangle_e0: [16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, -4.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            {
                name: "Room 2 Wall Floor N Triangle 1",
                triangle_p0: [16.0, 0.0, -16.0, 1.0],
                triangle_e0: [-16.0, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.0, 4.0, 0.0],
                reflectance_spd: ROOM_2_WALL_REFLECTANCE_SPD,
                glossiness: ROOM_2_WALL_GLOSINESS,
            },
            ...makeHint("Room 2 Hint 1", [1.0, 10e-3, -3.0, 1.0], [0.6, 0.8, 0.4, 1.0]),
            {
                name: "Room TP Sensor Triangle 0",
                triangle_p0: [1.5, 3.25, -15.95, 1.0],
                triangle_e0: [0.5, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, 0.5, 0.0, 0.0],
                reflectance_spd: [0.5, 0.5, 0.5, 1.0],
                glossiness: 1.0,
            },
            {
                name: "Room TP Sensor Triangle 1",
                triangle_p0: [2.0, 3.75, -15.95, 1.0],
                triangle_e0: [-0.5, 0.0, 0.0, 0.0],
                triangle_e1: [0.0, -0.5, 0.0, 0.0],
                reflectance_spd: [0.5, 0.5, 0.5, 1.0],
                glossiness: 1.0,
            },
            ...makeHint("Room 2 Hint 2", [15.0, 10e-3, -14.0, 1.0], [0.6, 0.4, 0.8, 1.0]),
            // #endregion
        ],
    }
};
