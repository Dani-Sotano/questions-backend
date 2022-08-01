const express = require('express')
const router = express.Router();
const schema = require('../models/schema')

// middleware functions 

async function getQuestions(req, res, next) {
    let questions;
    try {
        const result = await schema.Category.find(
            { name: req.params.category, "goals.name": [req.params.goal] }, {
            "goals.$": 1
        })
            .populate("goals.questions")
        if (result == null) {
            return res.status(404).json({ message: 'Cannot find questions' })
        }

        questions = result[0].goals[0].questions.map(el => el.question)

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.questions = { questions: questions };

    next();
}

async function getGoals(req, res, next) {
    try {
        const result = await schema.Category.aggregate([
            {
                '$match': {
                    'name': req.params.category
                }
            }, {
                '$unwind': {
                    'path': '$goals'
                }
            }, {
                '$project': {
                    'names': '$goals.name'
                }
            }, {
                '$group': {
                    '_id': 'goal_names',
                    'res': {
                        '$addToSet': '$names'
                    }
                }
            }
        ])

        if (result == null) {
            return res.status(404).json({ message: 'Cannot find questions' })
        }

        if (!result) {
            return res.status(400).json({ message: "request could not be processed" })
        }
        return res.status(201).json({ goals: result[0].res })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// TODO update is still open
async function addObjectToCategory(input) {
    try {
        const question = new schema.Question({
            question: input.question,
        })
        let id = question._id;
        await question.save();
        console.log("id", id)
        schema.Category.updateOne({
            name: input.category
        }, {
            "$push": {
                "goals.$[elemX].questions": id
            }
        }, {
            "arrayFilters": [{
                "elemX.name": input.goal
            }]
        }, function (err) {
            if (err) {
                return [400, err]
            }
        })
        return [201, question]

    } catch (err) {
        return [500, err]
    }
}



router.get('/list/:category/:goal', getQuestions, (req, res) => {
    res.json(res.questions)
})

router.get('/goals/:category', getGoals, (req, res) => {
    res.json(res.questions)
})



router.get('/categories', async (req, res) => {
    try {
        const elements = await schema.Category.find({}, { _id: 0, goals: 0, "__v": 0 })
        let categories = elements.map(el => el.name)
        res.json({ categories: categories })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


// TODO update questions in categories
router.post('/', async (req, res) => {
    const result = await addObjectToCategory(req.body);
    console.log(result)
    res.status(result[0]).json(result[1])
})





// TODO: upvote

// TODO: downvote

// TODO update category


module.exports = router;