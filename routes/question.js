let Users = require("../models/question").User;
let express = require("express");
let router = express.Router();

const { checkAuthAdmin, getCurrentUser } = require("../middleware/auth");
const { success, error, validation } = require("../helpers/responseApi");

const getPagination = (page, size) => {
    const limit = size ? +size : 100;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

router.get("/", checkAuthAdmin, async (req, res) => {
    const { page, size, title } = req.query;

    let condition = {
        ...(title && {
            title: { $regex: new RegExp(title), $options: "i" },
        }),
    };

    const { limit, offset } = getPagination(page, size);
    if (req.user.role == "ADMIN") {
        Users.paginate(condition, { offset, limit })
            .then((data) => {
                res.status(200).json(
                    success(
                        "OK",
                        {
                            users: {
                                totalDocs: data.totalDocs,
                                docs: data.docs,
                                totalPages: data.totalPages,
                                currentPage: data.page - 1,
                            },
                        },
                        res.statusCode
                    )
                );
            })
            .catch((err) => {
                res.status(500).json(
                    error(
                        err.message
                            ? err.message
                            : "Some error occurred while retrieving questions.",
                        res.statusCode
                    )
                );
            });
    } else {
        res.status(500).json(error("you are not authorized.", res.statusCode));
    }
});

router.get("/:id", checkAuthAdmin, async (req, res) => {
    let id = req.params.id;

    if (req.user.role == "ADMIN") {
        try {
            const user = await Users.findOne({ _id: id });
            res.status(200).json(success("OK", { user: user }, res.statusCode));
        } catch (err) {
            res.status(500).json(
                error(
                    err.message ? err.message : "Something went wrong.",
                    res.statusCode
                )
            );
        }
    } else {
        res.status(500).json(error("you are not authorized.", res.statusCode));
    }
});

router.post("/", checkAuthAdmin, async (req, res, next) => {
    let { email, company_name, contact_name, phone, answers } = req.body;
    if (req.user.role == "ADMIN") {
        try {
            let newQuestion = new Users({
                ...(phone && { phone: phone }),
                email,
                company_name,
                contact_name,
                answers,
            });

            const result = await newQuestion.save();
            res.status(200).json(
                success("OK", { question: result }, res.statusCode)
            );
        } catch (err) {
            res.status(500).json(
                error(
                    err.message ? err.message : "Something went wrong.",
                    res.statusCode
                )
            );
        }
    } else {
        res.status(500).json(error("you are not authorized.", res.statusCode));
    }
});

router.delete("/:id", checkAuthAdmin, async (req, res) => {
    let id = req.params.id;
    if (req.user.role == "ADMIN") {
        try {
            await Users.deleteOne({ _id: id });
            res.status(200).json(success("OK", { data: null }, res.statusCode));
        } catch (err) {
            res.status(500).json(
                error(
                    err.message ? err.message : "Something went wrong.",
                    res.statusCode
                )
            );
        }
    } else {
        res.status(500).json(error("you are not authorized.", res.statusCode));
    }
});

/* router.patch(
    "/:id",
    checkAuthAdmin, async (req, res) => {
        let id = req.params.id;
        let reqBody = req.body;

        let teamMemberUpdates = {
            ...(reqBody.name && { name: reqBody.name }),
            ...(reqBody.title && { title: reqBody.title }),
            ...(reqBody.company && { company: reqBody.company }),
            imageUrl: url + "/public/uploads/teams/" + req.file.filename,
            ...(reqBody.phone && { phone: reqBody.phone }),
            ...(reqBody.email && { email: reqBody.email }),
            ...(reqBody.facebook && { facebook: reqBody.facebook }),
            ...(reqBody.tiwtter && { tiwtter: reqBody.tiwtter }),
            ...(reqBody.instagram && { instagram: reqBody.instagram }),
        };

        try {
            const teamMember = await Team.updateOne(
                { _id: id },
                teamMemberUpdates
            );
            res.status(200).json(
                success("OK", { teamMember: teamMember }, res.statusCode)
            );
        } catch (err) {
            try {
            await fs.unlinkSync(req.file.path);
        } catch (err2) {
            console.log("file delete error", err2);
        }
            res.status(500).json(
                error(
                    err.message ? err.message : "Something went wrong.",
                    res.statusCode
                )
            );
        }
    }
); */

module.exports = router;
