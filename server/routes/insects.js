// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();
const { Insect } = require('../db/models');
const { where, Op } = require('sequelize');
/**
 * INTERMEDIATE BONUS PHASE 2 (OPTIONAL) - Code routes for the insects
 *   by mirroring the functionality of the trees
 */
// Your code here
router.get('/', async (req, res, next) => {
    try {
        const insects = await Insect.findAll({
            attributes: ['id', 'name', 'millimeters'],
            order: [
                ['millimeters', 'DESC']
            ]
        });
        res.json(insects);
    } catch (error) {
        next(error);
    }
});

router.get('/:insectId', async (req, res, next) => {
    let insect;
    try {
        insect = await Insect.findByPk(req.params.insectId)
        insect ?
            res.json(insect)
            :
            res.status(400).json({ message: 'Insect not found' });
    } catch (error) {
        next(error);
    }

});
router.post('/', async (req, res, next) => {

    try {
        const { name, description, fact, territory, millimeters } = req.body;
        const newInsect = await Insect.build({ name: name, description: description, fact: fact, territory: territory, millimeters: millimeters });
        await newInsect.validate();
        await newInsect.save();
        res.json({
            status: "success",
            Message: "A new Insect has been inserted",
            newInsect
        })
    } catch (err) {
        next({
            status: "error",
            message: 'Could not create new insect',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

router.delete('/:insectId', async (req, res, next) => {

    try {
        const insect = await Insect.findByPk(req.params.insectId);
        if (!insect) {
            res.status(400).json({
                status: "error",
                message: "isect could not be found"
            })
        }
        await insect.destroy()
        res.json({
            status: "success",
            message: `insect with id ${req.params.insectId} has been deleted successfully`,
            insect
        });

    } catch (err) {
        next({
            status: "error",
            message: 'Could not create new insect',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});
router.put('/:insectId', async (req, res, next) => {


    try {
        const { id, name, description, fact, territory, millimeters } = req.body;
        const insect = await Insect.findByPk(req.params.insectId);
        if (Number(req.params.insectId) !== Number(id)) {
            return next({
                status: "error",
                message: `Could not update tree`,
                details: `${req.params.insectId} does not match ${req.body.id}`
            });
        };
        if (!aTree) {
            return next({
                status: "not-found",
                message: `Could not update tree ${req.params.insectId}`,
                details: "Tree not found"
            });
        };

        name !== undefined ? insect.name = name : insect.name;
        description !== undefined ? insect.description = description : insect.description;
        fact !== undefined ? insect.fact = fact : insect.fact;
        territory !== undefined ? insect.territory = territory : insect.territory;
        millimeters !== undefined ? insect.millimeters = millimeters : insect.millimeters;
        await insect.validate();
        await insect.save();

        res.json(
            {
                status: "Successe",
                message: `Insect with id ${req.params.insectId} updated successfully`,
                insect
            }
        );
    } catch (err) {
        next({
            status: "error",
            message: 'Could not update new tree',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }


});
router.get('/search/:value', async (req, res, next) => {
    let insects = [];
    const searchTirm = req.params.value;
    insects.push(
        await Insect.findAll({
            where: {
                name: {
                    [Op.like]: `%${searchTirm}%`
                }
            },
            attributes: ["id", "name", "fact"],
            order: [
                ["millimeters", "DESC"]
            ]
        })
    );

    res.json(insects);
});

// Export class - DO NOT MODIFY
module.exports = router;
