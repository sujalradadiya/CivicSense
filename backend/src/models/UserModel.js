const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        age: {
            type: Number,
            default: null,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        contact: {
            type: String,
            trim: true,
            default: undefined,
        },
        city: {
            type: String,
            trim: true,
            default: "",
        },
        stateId: {
            type: Schema.Types.ObjectId,
            ref: "State",
            default: null,
        },
        roleId: {
            type: Schema.Types.ObjectId,
            ref: "roles",
            default: null,
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        password: {
            type: String,
            required: false,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Method to verify password using bcrypt
UserSchema.methods.comparePassword = function (enteredPassword) {
    if (!this.password || !enteredPassword) return false;
    return bcrypt.compareSync(enteredPassword, this.password);
};

// Remove password field when converting document to JSON
UserSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const UserModel = mongoose.models.user || mongoose.model("user", UserSchema);
if (!mongoose.models.User) {
    mongoose.model("User", UserSchema);
}

module.exports = UserModel;