const Complain = require('../models/complainSchema.js');

const complainCreate = async (req, res) => {
    try {

        const complain = new Complain(req.body);
        const result = await complain.save();

        res.send(result);

    } catch (err) {

        console.log("Complain Error:", err); // ADD THIS
        res.status(500).json(err);

    }
};

const complainList = async (req, res) => {
    try {

        const complains = await Complain
            .find({ school: req.params.id })
            .populate("student", "name");

        res.status(200).json(complains);

    } catch (err) {

        console.log("Complain Error:", err);
        res.status(500).json(err);

    }
};

const complainDelete = async (req, res) => {

    try {

        const deletedComplain = await Complain.findByIdAndDelete(req.params.id);

        if (!deletedComplain) {
            return res.status(404).json({ message: "Complain not found" });
        }

        res.status(200).json({ message: "Complain deleted successfully" });

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: "Error deleting complain" });

    }
};

module.exports = { complainCreate, complainList, complainDelete, };
