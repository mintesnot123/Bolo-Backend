let express = require("express");
let router = express.Router();
let bcrypt = require("bcryptjs");
const crypto = require("crypto");
var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

let constants = require("../constants/envConstants");
//let emailTempletes = require("../constants/emailTempletes");
const { success, error, validation } = require("../helpers/responseApi");

let { getCurrentUser } = require("../middleware/auth");
let auth = require("../controllers/auth");
let User = require("../models/users").User;
const Token = require("../models/token").Token;

var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: constants.email,
        pass: constants.emailPass,
    },
});

router.get("/", getCurrentUser, (req, res) => {
    res.status(200).json(success("OK", { user: req.user }, res.statusCode));
});

router.post("/login", async (req, res) => {
    let { email, password } = req.body;

    if (email && password) {
        try {
            let user = await User.find().where({ email: email });

            if (user.length > 0) {
                let comparisonResult = await bcrypt.compare(
                    password,
                    user[0].password
                );
                if (comparisonResult) {
                    let token = auth.generateToken(user[0]);
                    let firstUser = user[0];
                    /* if (!user[0].verified) {
                        // Generate a verification token with the user's ID
                        const verificationToken =
                            user[0].generateVerificationToken();
                        // Email the user a unique verification link
                        const url = `${constants.BASE_URL}/api/auth/verify/${verificationToken}`;
                        transporter.sendMail({
                            to: user[0].email,
                            subject: "Verify Account",
                            html: emailTempletes.verifyEmailTemplete(url),
                        });
                    } */
                    res.status(200).json(
                        success(
                            "OK",
                            {
                                user: {
                                    token: token,
                                    email: firstUser.email,
                                    uid: firstUser._id,
                                    role: firstUser.role,
                                    email_verified: firstUser.verified,
                                },
                            },
                            res.statusCode
                        )
                    );
                } else {
                    res.status(422).json(
                        validation("email and password not match!")
                    );
                }
            } else {
                res.status(400).json(
                    error("User not exist with this email.", res.statusCode)
                );
            }
        } catch (err) {
            res.status(500).json(
                error(
                    err.message ? err.message : "Something went wrong.",
                    res.statusCode
                )
            );
        }
    } else {
        res.status(422).json(
            validation("both email and password are required")
        );
    }
});

router.post("/register", async (req, res) => {
    let { email, password, name, phone } = req.body;

    if (email && password && name) {
        try {
            let user = await User.find().where({ email: email });

            //if this email hasnt been used someone else then add this email to the DB.
            if (user.length === 0) {
                let encryptedPass = await bcrypt.hash(password, 12); //Async func
                let newUser = new User({
                    ...(phone && { phone: phone }),
                    name: name,
                    email: email,
                    password: encryptedPass,
                    role: "USER",
                });

                const user = await newUser.save();
                const names = name.split(" ");

                /* try {
                    const userId = user._id.toString();
                    let newProfile = new Profile({
                        email: email,
                        user: userId,
                        firstname: names[0] || "",
                        lastname: names[1] || "",
                    });
                    const profile = await newProfile.save();
                } catch (error) {
                    console.log("create profile error : ", error);
                } */

                /* // Generate a verification token with the user's ID
                const verificationToken = user.generateVerificationToken();
                // Email the user a unique verification link
                const url = `${constants.BASE_URL}/api/auth/verify/${verificationToken}`;
                transporter.sendMail({
                    to: email,
                    subject: "Verify Account",
                    html: emailTempletes.verifyEmailTemplete(url),
                }); */

                let token = auth.generateToken(user);
                //name of the key:auth_token , value:token
                //res.cookie("auth_token", token); //This token (auth_token) is automaticaaly sent for the client

                res.status(200).json(
                    success(
                        "OK",
                        {
                            user: {
                                token: token,
                                email: user.email,
                                uid: user._id,
                                role: user.role,
                                email_verified: user.verified,
                            },
                        },
                        res.statusCode
                    )
                );
            } else {
                res.status(500).json(
                    error(
                        "User Alreasy exist. login to your account",
                        res.statusCode
                    )
                );
            }
        } catch (err) {
            res.status(500).json(
                error(
                    err.message ? err.message : "Something went wrong.",
                    res.statusCode
                )
            );
        }
    } else {
        res.status(422).json(
            validation("name, email and password are required")
        );
    }
});

router.get("/resend", getCurrentUser, async (req, res) => {
    const currentUser = req.user;

    try {
        let user = await User.find().where({ email: currentUser.email });

        if (user.length > 0) {
            let token = auth.generateToken(user[0]);
            let firstUser = user[0];
            if (!user[0].verified) {
                /* // Generate a verification token with the user's ID
                const verificationToken = user[0].generateVerificationToken();
                // Email the user a unique verification link
                const url = `${BASE_URL}/api/auth/verify/${verificationToken}`;
                transporter.sendMail({
                    to: user[0].email,
                    subject: "Verify Account",
                    html: emailTempletes.verifyEmailTemplete(url),
                });
                res.status(200).json(
                    success(
                        "OK",
                        {
                            message: "Verification email sent check you email",
                        },
                        res.statusCode
                    )
                ); */
            } else {
                res.status(200).json(
                    success(
                        "OK",
                        {
                            message: "Email already verified",
                        },
                        res.statusCode
                    )
                );
            }
        } else {
            res.status(200).json(
                success(
                    "OK",
                    {
                        message: "User not exist",
                    },
                    res.statusCode
                )
            );
        }
    } catch (err) {
        res.status(200).json(
            success(
                "OK",
                {
                    message: "Something went wrong.",
                },
                res.statusCode
            )
        );
    }
});

router.get("/verify/:id", async (req, res) => {
    const { id } = req.params;

    // Check we have an id
    if (!id) {
        return res.status(422).send({
            message: "Missing Token",
        });
    }
    // Step 1 -  Verify the token from the URL
    let payload = null;
    try {
        payload = jwt.verify(id, constants.USER_VERIFICATION_TOKEN_SECRET);
    } catch (err) {
        return res.status(500).send(err);
    }
    try {
        // Step 2 - Find user with matching ID
        const user = await User.findOne({ _id: payload.ID }).exec();
        if (!user) {
            return res.status(404).send({
                message: "User does not  exists",
            });
        }
        // Step 3 - Update user verification status to true
        user.verified = true;
        await user.save();
        return res.status(200).send({
            message: "Account Verified",
        });
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post("/requestResetPassword", async (req, res) => {
    const { email, newPassword } = req.body;

    if (email && newPassword) {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json(
                error("User not exist with this email.", res.statusCode)
            );
        } else {
            let token = await Token.findOne({ userId: user._id });
            if (token) await token.deleteOne();

            let resetToken = crypto.randomBytes(32).toString("hex");
            const hash = await bcrypt.hash(resetToken, 12);
            const encryptedPass = await bcrypt.hash(newPassword, 12);

            await new Token({
                userId: user._id,
                token: hash,
                newPassword: encryptedPass,
                createdAt: Date.now(),
            }).save();

            const link = `${BASE_URL}/api/auth/resetPassword?token=${resetToken}&id=${user._id}`;

            /* transporter.sendMail({
                to: email,
                subject: "Reset Password",
                html: emailTempletes.resetPasswordEmailTemplete(
                    link,
                    user.name
                ),
            }); */
            return res.status(201).send({
                message: `Sent a reset password email to ${email}. check your email.`,
            });
        }
    } else {
        res.status(422).json(validation("email and new password are required"));
    }
});

router.get("/resetPassword", async (req, res) => {
    const { id, token } = req.query;

    let passwordResetToken = await Token.findOne({ id });

    if (!passwordResetToken) {
        res.status(400).json(
            error("Invalid or expired password reset token.", res.statusCode)
        );
    } else {
        const isValid = await bcrypt.compare(token, passwordResetToken.token);

        if (!isValid) {
            res.status(400).json(
                error(
                    "Invalid or expired password reset token.",
                    res.statusCode
                )
            );
        } else {
            const hash = passwordResetToken.newPassword;

            await User.updateOne(
                { _id: id },
                { $set: { password: hash } },
                { new: true }
            );

            const user = await User.findById({ _id: id });
            /* sendEmail(
                user.email,
                "Password Reset Successfully",
                {
                    name: user.name,
                },
                "./template/resetPassword.handlebars"
            ); */
            res.status(201).send({
                message: `Password reset successfully`,
            });

            await passwordResetToken.deleteOne();
        }
    }
});

module.exports = router;
