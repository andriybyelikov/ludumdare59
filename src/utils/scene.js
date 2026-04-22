import { ATTRIBUTES } from '../../data/attributes.js';
import { SCENE } from '../../data/scene.js';
import { scalar, vec4, mat4 } from './math.js';

function flattenSceneTree(node)
{
    if ('children' in node)
    {
        let list = [];

        for (const child of node.children)
        {
            child.parent = node;

            if ('transform' in child === false)
            {
                child.transform = {
                    translation: mat4.identity(),
                    rotation: mat4.identity(),
                };
            }

            list = [...list, ...flattenSceneTree(child)];
        }

        return list;
    }

    return [node];
}

export function computeSceneData()
{
    const objects = flattenSceneTree(SCENE.root);
    objects.sort((a, b) => {
        return parseInt('emission_spd' in b ? 1 : 0) - parseInt('emission_spd' in a ? 1: 0);
    });
    const objectCount = objects.length;
    const lightCount = objects.filter((x) => 'emission_spd' in x).length;

    //

    const scalarEquality = (a, b) => a === b;
    const vectorEquality = (a, b) => b.every((s, i) => s === a[i]);

    const scalars = coolfunction(
        objects,
        ATTRIBUTES.filter((x) => x.type === 'scalar'),
        scalarEquality
    );

    const vectors = coolfunction(
        objects,
        ATTRIBUTES.filter((x) => x.type === 'vector'),
        vectorEquality
    );

    const vectorsMutable = coolfunction(
        objects,
        ATTRIBUTES.filter((x) => x.type === 'vector' && x.mutable),
        vectorEquality
    );

    //
    // console.log('SCENE TREE TRANSFORMS UNIFORM SIZE', transformsPerObjectUniformSize);


    // console.log('OBJECTS', objects);
    
    // console.log('HEIGHT', height);

    // console.log('transformsPerObjectAttributeUniformSize', transformsPerObjectAttributeUniformSize);

    return {
        objects: objects,
        objectCount: objectCount,
        lightCount: lightCount,
        scalars: scalars,
        vectors: vectors,
        vectorsMutable: vectorsMutable,
    };
}

function coolfunction(objects, attributes, equality)
{
    // sort all mutable values before immutable values

    const attributeNames = attributes.map((attribute) => attribute.name);

    let objectAttributeMasks = objects.map((object) =>
        attributes.reduce((mask, attribute, index) => mask | (attribute.name in object) << index, 0)
    );
    // console.log('');
    // console.log(objectAttributeMasks);

    let objectAttributePointerLists = objects.map((_, i, arr) =>
        arr.slice(0, i)
            .map((object) => attributes.filter((attribute) => attribute.name in object).length)
            .reduce((total, count) => total + count, 0)
    );
    
    // console.log('objectAttributePointerLists', objectAttributePointerLists);

    let valuesMutable = objects
        .map((object, objectID) =>
            attributes
                .filter((attribute) => attribute.mutable === true)
                .filter((attribute) => attribute.name in object)
                .map((attribute) => ({
                    // objectID: objectID,
                    // objectName: object.name,
                    // attributeID: ATTRIBUTES.indexOf(attribute),
                    // attributeName: attribute.name,
                    pointerIndex: objectAttributePointerLists[objectID] +
                        attributes
                            .filter((attribute) => attribute.name in object)
                            .indexOf(attribute),
                    value: object[attribute.name],
                }))
        ).flat();
    valuesMutable = valuesMutable.map((x, i) => ({
        pointerIndex: x.pointerIndex,
        valueIndex: i,
        value: x.value,
    }));
    // console.log('valuesMutable', valuesMutable);

    const mutables = valuesMutable.map((objectValue) => objectValue.value);
    // console.log('mutables', mutables);

    let valuesImmutable = objects
        .map((object, objectID) =>
            attributes
                .filter((attribute) => attribute.mutable === false)
                .filter((attribute) => attribute.name in object)
                .map((attribute) => ({
                    // objectID: objectID,
                    // objectName: object.name,
                    // attributeID: ATTRIBUTES.indexOf(attribute),
                    // attributeName: attribute.name,
                    pointerIndex: objectAttributePointerLists[objectID] +
                        attributes
                            .filter((attribute) => attribute.name in object)
                            .indexOf(attribute),
                    value: object[attribute.name],
                }))
        ).flat();
    

    
    
    const immutables = valuesImmutable.map((objectValue) => objectValue.value);
    
    const uniqueImmutables = immutables.reduce((arr, val) => arr.some((x) => equality(x, val)) ? arr : [...arr, val], []);

    valuesImmutable = valuesImmutable.map((x) => ({
        pointerIndex: x.pointerIndex,
        valueIndex: uniqueImmutables.findIndex((b) => equality(x.value, b)) + mutables.length,
        value: x.value,
    }));

    // console.log('valuesImmutable', valuesImmutable);
    // console.log('immutables', immutables);
    // console.log('uniqueImmutables', uniqueImmutables);
    
    
    const valuesMutableImmutable = [
        ...valuesMutable,
        ...valuesImmutable,
    ].flat().sort((a, b) => a.pointerIndex - b.pointerIndex);

    // console.log('valuesMutableImmutable', valuesMutableImmutable);

    //

    const objectAttributeCursorsV2 = valuesMutableImmutable.map((x) => x.valueIndex);
    // console.log('objectAttributeCursorsV2', objectAttributeCursorsV2);
    const objectAttributeValuesDistinctV2 = [
        ...mutables,
        ...uniqueImmutables,
    ];
    // console.log('objectAttributeValuesDistinctV2', objectAttributeValuesDistinctV2);

    return {
        attributeNames: attributeNames,
        objectAttributeMasks: objectAttributeMasks,
        objectAttributePointerLists: objectAttributePointerLists,
        objectAttributePointers: objectAttributeCursorsV2,
        objectAttributeValues: objectAttributeValuesDistinctV2,
    };
}
