// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

/**
 * BASIC PHASE 1, Step A - Import model
 */
// Your code here
const { Tree } = require('../db/models');
const { where } = require('sequelize');
const { Op } = require('sequelize');
/**
 * INTERMEDIATE BONUS PHASE 1 (OPTIONAL), Step A:
 *   Import Op to perform comparison operations in WHERE clauses
 **/
// Your code here

/**
 * BASIC PHASE 1, Step B - List of all trees in the database
 *
 * Path: /
 * Protocol: GET
 * Parameters: None
 * Response: JSON array of objects
 *   - Object properties: heightFt, tree, id
 *   - Ordered by the heightFt from tallest to shortest
 */
router.get('/', async (req, res, next) => {
    let trees = [];

    // Your code here
    trees.push(
        await Tree.findAll({
            attributes: ['id', 'tree', 'heightFt'],
            order: [
                ['heightFt', 'DESC']
            ]
        })
    );

    res.json(trees[0]);
});

/**
 * BASIC PHASE 1, Step C - Retrieve one tree with the matching id
 *
 * Path: /:id
 * Protocol: GET
 * Parameter: id
 * Response: JSON Object
 *   - Properties: id, tree, location, heightFt, groundCircumferenceFt
 */
router.get('/:id', async (req, res, next) => {
    let tree;

    try {
        // Your code here
        tree = await Tree.findByPk(req.params.id);

        if (tree) {
            res.json(tree);
        } else {
            next({
                status: "not-found",
                message: `Could not find tree ${req.params.id}`,
                details: 'Tree not found'
            });
        }
    } catch (err) {
        next({
            status: "error",
            message: `Could not find tree ${req.params.id}`,
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * BASIC PHASE 2 - INSERT tree row into the database
 *
 * Path: /trees
 * Protocol: POST
 * Parameters: None
 * Request Body: JSON Object
 *   - Properties: name, location, height, size
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully created new tree
 *   - Property: data
 *     - Value: object (the new tree)
 */
router.post('/', async (req, res, next) => {
    const { name, location, height, size } = req.body;
    try {
        const newTree = Tree.build({ tree: name, location: location, heightFt: height, groundCircumferenceFt: size });
        await newTree.validate();
        await newTree.save();
        res.json({
            status: "success",
            message: "Successfully created new tree",
            data: newTree
        });
    } catch (err) {
        next({
            status: "error",
            message: 'Could not create new tree',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * BASIC PHASE 3 - DELETE a tree row from the database
 *
 * Path: /trees/:id
 * Protocol: DELETE
 * Parameter: id
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully removed tree <id>
 * Custom Error Handling:
 *   If tree is not in database, call next() with error object
 *   - Property: status
 *     - Value: not-found
 *   - Property: message
 *     - Value: Could not remove tree <id>
 *   - Property: details
 *     - Value: Tree not found
 */
router.delete('/:id', async (req, res, next) => {

    try {
        const atree = await Tree.findByPk(req.params.id);
        if (atree) {
            await atree.destroy();
            res.json({
                status: "success",
                message: `Successfully removed tree ${req.params.id}`
            });
        } else {
            err;
        }
    } catch (err) {
        next({
            status: "not-found",
            message: `Could not remove tree ${req.params.id}`,
            details: "Tree not found"
        });
    }


    // try {
    //     const aTree = await Tree.findByPk(req.params.id);
    //     await aTree.destroy();
    //     res.json({
    //         status: "success",
    //         message: `Successfully removed tree ${req.params.id}`,
    //     });
    // } catch (err) {
    //     next({
    //         status: "error",
    //         message: `Could not remove tree ${req.params.id}`,
    //         details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
    //     });
    // }
});

/**
 * INTERMEDIATE PHASE 4 - UPDATE a tree row in the database
 *   Only assign values if they are defined on the request body
 *
 * Path: /trees/:id
 * Protocol: PUT
 * Parameter: id
 * Request Body: JSON Object
 *   - Properties: id, name, location, height, size
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully updated tree
 *   - Property: data
 *     - Value: object (the updated tree)
 * Custom Error Handling 1/2:
 *   If id in request params does not match id in request body,
 *   call next() with error object
 *   - Property: status
 *     - Value: error
 *   - Property: message
 *     - Value: Could not update tree <id>
 *   - Property: details
 *     - Value: <params id> does not match <body id>
 * Custom Error Handling 2/2:
 *   If tree is not in database, call next() with error object
 *   - Property: status
 *     - Value: not-found
 *   - Property: message
 *     - Value: Could not update tree <id>
 *   - Property: details
 *     - Value: Tree not found
 */
router.put('/:id', async (req, res, next) => {
    try {
        // Your code here
        const { id, name, location, height, size } = req.body;
        const aTree = await Tree.findByPk(req.params.id);

        if (Number(req.params.id) !== Number(id)) {
            return next({
                status: "error",
                message: `Could not update tree`,
                details: `${req.params.id} does not match ${req.body.id}`
            });
        };
        if (!aTree) {
            return next({
                status: "not-found",
                message: `Could not update tree ${req.params.id}`,
                details: "Tree not found"
            });
        };

        //id !== undefined ? aTree.id = id : aTree.id;
        name !== undefined ? aTree.tree = name : aTree.tree;
        location !== undefined ? aTree.location = location : aTree.location;
        height !== undefined ? aTree.heightFt = height : aTree.heightFt;
        size !== undefined ? aTree.groundCircumferenceFt = size : aTree.groundCircumferenceFt;

        await aTree.validate();
        await aTree.save();
        res.json({
            status: "success",
            message: "Successfully updated tree",
            data: aTree
        })
    } catch (err) {
        next({
            status: "error",
            message: 'Could not update new tree',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * INTERMEDIATE BONUS PHASE 1 (OPTIONAL), Step B:
 *   List of all trees with tree name like route parameter
 *
 * Path: /search/:value
 * Protocol: GET
 * Parameters: value
 * Response: JSON array of objects
 *   - Object properties: heightFt, tree, id
 *   - Ordered by the heightFt from tallest to shortest
 */
router.get('/search/:value', async (req, res, next) => {
    let trees = [];
    const searchTirm = req.params.value;
    trees.push(
        await Tree.findAll({
            where: {
                tree: {
                    [Op.like]: `%${searchTirm}%`
                }
            },
            attributes: ["id", "tree", "heightFt"],
            order: [
                ["heightFt", "DESC"]
            ]
        })
    );

    res.json(trees);
});

// Export class - DO NOT MODIFY
module.exports = router;
