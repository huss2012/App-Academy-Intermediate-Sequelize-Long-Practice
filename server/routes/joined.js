// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

// Import models - DO NOT MODIFY
const { Insect, Tree } = require('../db/models');
const { Op, where } = require("sequelize");

/**
 * PHASE 7 - Step A: List of all trees with insects that are near them
 *
 * Approach: Eager Loading
 *
 * Path: /trees-insects
 * Protocol: GET
 * Response: JSON array of objects
 *   - Tree properties: id, tree, location, heightFt, insects (array)
 *   - Trees ordered by the tree heightFt from tallest to shortest
 *   - Insect properties: id, name
 *   - Insects for each tree ordered alphabetically by name
 */
router.get('/trees-insects', async (req, res, next) => {
    let trees = [];

    trees = await Tree.findAll({
        attributes: ['id', 'tree', 'location', 'heightFt'],
        include:
        {
            model: Insect,
            attributes: ['id', 'name'],
            through: { attributes: [] },
            where: {
                name: {
                    [Op.ne]: null,
                },
            }
        },
        order: [
            ['heightFt', 'DESC'],
            [Insect, 'name', 'ASC']
        ]

    });

    res.json(trees);
});

/**
 * PHASE 7 - Step B: List of all insects with the trees they are near
 *
 * Approach: Lazy Loading
 *
 * Path: /insects-trees
 * Protocol: GET
 * Response: JSON array of objects
 *   - Insect properties: id, name, trees (array)
 *   - Insects for each tree ordered alphabetically by name
 *   - Tree properties: id, tree
 *   - Trees ordered alphabetically by tree
 */
router.get('/insects-trees', async (req, res, next) => {
    let payload = [];

    const insects = await Insect.findAll({
        include: {
            model: Tree,
            attributes: ['id', 'tree'],
            through: { attributes: [] },

        },
        attributes: ['id', 'name', 'description'],
        order: [
            ['name'],
            [Tree, 'tree']
        ],
    });
    for (let i = 0; i < insects.length; i++) {
        const insect = insects[i];
        payload.push({
            id: insect.id,
            name: insect.name,
            description: insect.description,
            trees: insect.Trees
        });
    }

    res.json(payload);
});

/**
 * ADVANCED PHASE 3 - Record information on an insect found near a tree
 *
 * Path: /associate-tree-insect
 * Protocol: POST
 * Parameters: None
 * Request Body: JSON Object
 *   - Property: tree Object
 *     with id, name, location, height, size
 *   - Property: insect Object
 *     with id, name, description, fact, territory, millimeters
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully recorded information
 *   - Property: data
 *     - Value: object (the new tree)
 * Expected Behaviors:
 *   - If tree.id is provided, then look for it, otherwise create a new tree
 *   - If insect.id is provided, then look for it, otherwise create a new insect
 *   - Relate the tree to the insect
 * Error Handling: Friendly messages for known errors
 *   - Association already exists between {tree.tree} and {insect.name}
 *   - Could not create association (use details for specific reason)
 *   - (Any others you think of)
 */
// Your code here
router.post('/associate-tree-insect', async (req, res, next) => {
    // try {
    //     const { tree, insect } = req.body;

    //     //handle tree
    //     let aTree;
    //     let anInsect;

    //     if (!tree) return error;

    //     if (tree.id) {
    //         aTree = await Tree.findByPk(tree.id);
    //         if (!aTree) return error;
    //     };
    //     if (!tree.id) {
    //         const aTree = await Tree.build({
    //             tree: tree.name,
    //             location: tree.location,
    //             heightFt: tree.height,
    //             groundCircumferenceFt: tree.size
    //         });
    //         await aTree.validate();
    //         await aTree.save();
    //     };

    //     //hanle insect
    //     if (!insect) return error;

    //     if (insect.id) {
    //         anInsect = await Insect.findByPk(tree.id);
    //         if (!anInsect) return error;
    //     };
    //     if (!insect.id) {
    //         const anInsect = await Insect.build({
    //             name: insect.name,
    //             description: insect.description,
    //             fact: insect.fact,
    //             territory: insect.territory,
    //             millimeters: insect.millimeters
    //         });
    //         await anInsect.validate();
    //         await anInsect.save();
    //     };
    //     //detect existing relationshiop
    //     if (aTree && anInsect) {
    //         const association = await aTree.hasInsect(anInsect);
    //         if (association) {
    //             return error.message = `Association already exists between ${aTree.tree} $ ${anInsect.name}`;
    //         }
    //     }
    //     await aTree.addInsects(anInsect);

    //     res.json({
    //         status: "success",
    //         message: "Successfully created association",
    //         data: {tree: aTree, insect: anInsect}
    //     })

    // } catch (error) {
    //     next({
    //         status: 'error',
    //         message: 'Could not create association',
    //         details: error.errors ? error.errors.map(item => item.message).join(', ') : error.message
    //     })
    // }
    try {
        const { tree, insect } = req.body;

        if (!tree) {
            return next({
                status: 'error',
                message: 'Could not create association',
                details: 'Tree missing in request'
            });
        }

        if (!insect) {
            return next({
                status: 'error',
                message: 'Could not create association',
                details: 'Insect missing in request'
            });
        }

        // Handle tree
        let aTree;

        if (tree.id) {
            aTree = await Tree.findByPk(tree.id);
            if (!aTree) {
                return next({
                    status: 'error',
                    message: 'Could not create association',
                    details: 'Tree not found'
                });
            }
        } else {
            aTree = await Tree.build({
                tree: tree.name,
                location: tree.location,
                heightFt: tree.height,
                groundCircumferenceFt: tree.size
            });
            await aTree.validate();
            await aTree.save();
        }

        // Handle insect
        let anInsect;

        if (insect.id) {
            anInsect = await Insect.findByPk(insect.id);
            if (!anInsect) {
                return next({
                    status: 'error',
                    message: 'Could not create association',
                    details: 'Insect not found'
                });
            }
        } else {
            anInsect = await Insect.build({
                name: insect.name,
                description: insect.description,
                fact: insect.fact,
                territory: insect.territory,
                millimeters: insect.millimeters
            });
            await anInsect.validate();
            await anInsect.save();
        }

        // Detect existing relationship
        const associationExists = await aTree.hasInsect(anInsect);
        if (associationExists) {
            return next({
                status: 'error',
                message: 'Could not create association',
                details: `Association already exists between ${aTree.tree} and ${anInsect.name}`
            });
        }

        // Create association
        await aTree.addInsect(anInsect);

        res.json({
            status: 'success',
            message: 'Successfully created association',
            data: { tree: aTree, insect: anInsect }
        });

    } catch (error) {
        next({
            status: 'error',
            message: 'Could not create association',
            details: error.errors ? error.errors.map(item => item.message).join(', ') : error.message
        });
    }
});
// Export class - DO NOT MODIFY
module.exports = router;
