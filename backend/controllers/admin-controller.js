
import Admin from '../models/adminSchema.js';



const adminRegister = async (req, res) => {
    try {
        const admin = new Admin({
            ...req.body
        });

        const existingAdminByEmail = await Admin.findOne({ email: req.body.email });
        const existingSchool = await Admin.findOne({ schoolName: req.body.schoolName });

        if (existingAdminByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else if (existingSchool) {
            res.send({ message: 'School name already exists' });
        }
        else {
            let result = await admin.save();
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const adminLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        let admin = await Admin.findOne({ email: req.body.email });
        if (admin) {
            if (req.body.password === admin.password) {
                admin.password = undefined;
                res.send(admin);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "User not found" });
        }
    } else {
        res.send({ message: "Email and password are required" });
    }
};

const getAdminDetail = async (req, res) => {
    try {
        let admin = await Admin.findById(req.params.id);
        if (admin) {
            admin.password = undefined;
            res.send(admin);
        }
        else {
            res.send({ message: "No admin found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}
const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // ✅ Update profilePic from JSON if sent
    if (req.body.profilePic) {
      admin.profilePic = req.body.profilePic;
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.schoolName = req.body.schoolName || admin.schoolName;

    await admin.save();

    res.json(admin);

  } catch (error) {
    res.status(500).json(error);
  }
};
/////////////////////////////////////////////////////////
// DELETE ADMIN
/////////////////////////////////////////////////////////

const deleteAdmin = async (req, res) => {

    try {

        const admin = await Admin.findByIdAndDelete(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json({
            message: "Admin deleted successfully"
        });

    } catch (error) {

        res.status(500).json(error);

    }

};



export  { adminRegister, adminLogIn, getAdminDetail, deleteAdmin, updateAdmin};
