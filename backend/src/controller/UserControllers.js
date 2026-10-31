const userSchema = require("../models/UserModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

//add user
const adduser = async(req,res)=>{
    try{
        const userData = { ...req.body };
        if (userData.email) {
            userData.email = userData.email.trim().toLowerCase();
            const existing = await userSchema.findOne({ email: userData.email });
            if (existing) {
                return res.status(400).json({
                    message: "An account with this email address already exists."
                });
            }
        }
        // Allow selected role (USER or ADMIN), default to USER
        if (userData.role && String(userData.role).toUpperCase() === "ADMIN") {
            userData.role = "ADMIN";
        } else {
            userData.role = "USER";
        }
        userData.isActive = true;

        if (userData.password && typeof userData.password === "string" && userData.password.trim()) {
            userData.password = bcrypt.hashSync(userData.password.trim(), 10);
        } else {
            delete userData.password;
        }
        const SaveUser = await userSchema.create(userData);

        const actualRole = SaveUser.role || "USER";
        const jwtSecret = process.env.JWT_SECRET || "civicsense_jwt_secret_key_2026";
        const token = jwt.sign(
            { id: SaveUser._id, email: SaveUser.email, role: actualRole },
            jwtSecret,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "data add successfully!!",
            data: SaveUser,
            user: {
                id: SaveUser._id,
                name: SaveUser.name,
                email: SaveUser.email,
                role: actualRole
            },
            token: token
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
}

// get all user 
const getUsers = async (req, res) => {
    try {
        const users = await userSchema.find();

        res.status(200).json({
            message: "Users fetched successfully",
            data: users,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


//get user by id
const getUserById = async (req, res) => {
    try {
        const id = req.params.id;

        const foundUser = await userSchema.findById(id);

        if (!foundUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "User found",
            data: foundUser,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

// Update User
const updateUser = async (req, res) => {
    try {

        const id = req.params.id;

        const updatedUser = await userSchema.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {

        const id = req.params.id;

        const deletedUser = await userSchema.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "User deleted successfully",
            data: deletedUser,
        });

    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};


const loginUser = async (req, res) => {
    try {
        const { name, email, contact, password } = req.body;

        const orConditions = [];
        if (email) orConditions.push({ email: email.trim().toLowerCase() });
        if (contact) orConditions.push({ contact: String(contact).trim() });
        if (name && !email && !contact) orConditions.push({ name: name.trim() });

        if (orConditions.length === 0) {
            return res.status(400).json({
                message: "Please provide email, contact number, or name to login"
            });
        }

        const foundUser = await userSchema.findOne({ $or: orConditions });

        if (!foundUser) {
            return res.status(404).json({
                message: "User not found or credentials do not match"
            });
        }

        // If password is set on user and provided in request, verify it
        if (foundUser.password && password) {
            const isMatch = bcrypt.compareSync(password, foundUser.password);
            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid password"
                });
            }
        }

        if (foundUser.isActive === false) {
            return res.status(403).json({
                message: "Account is deactivated. Please contact an administrator."
            });
        }

        const actualRole = foundUser.role || "USER";
        const jwtSecret = process.env.JWT_SECRET || "civicsense_jwt_secret_key_2026";
        const token = jwt.sign(
            { id: foundUser._id, email: foundUser.email, role: actualRole },
            jwtSecret,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "login success",
            data: foundUser,
            user: {
                id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                role: actualRole
            },
            token: token
        });

    } catch (err) {
        res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
};

module.exports={
    adduser,
    getUserById,
    getUsers,
    updateUser,
    deleteUser,
    loginUser,

}