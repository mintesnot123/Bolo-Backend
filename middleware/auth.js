let auth = require("../controllers/auth");
const { error, success } = require("../helpers/responseApi");
const constants = require("../constants/envConstants");

//checking whether the user is authorized to have access to the admin page.
function checkAuthAdmin(req, res, next) {
    let token = req.header(constants.TOKE_NAME);

    if (token) {
        const user = auth.checkToken(token, "ADMIN");
        if (user.state) {
            req.user = user.user;
            next();
        } else {
            res.status(400).json(error("Not authorized!.", res.statusCode));
        }
    } else {
        res.status(400).json(error("Not authorized!.", res.statusCode));
    }
}

//checking whether the user is authorized to have access to the users page.
function checkAuthUser(req, res, next) {
    let token = req.header(constants.TOKE_NAME);

    if (token) {
        const user = auth.checkToken(token, "USER");
        if (user.state) {
            req.user = user.user;
            next();
        } else {
            res.status(400).json(error("Not authorized!.", res.statusCode));
        }
    } else {
        res.status(400).json(error("Not authorized!.", res.statusCode));
    }
}

//checking whether the user is authorized to have access to the any user page.
function checkAuthAnyUser(req, res, next) {
    let token = req.header(constants.TOKE_NAME);

    if (token) {
        const user = auth.checkToken(token, "USER");
        const adminUser = auth.checkToken(token, "ADMIN");

        if (user.state || adminUser.state) {
            req.user = adminUser.state ? adminUser.user : user.user;
            next();
        } else {
            res.status(400).json(error("Not authorized!.", res.statusCode));
        }
    } else {
        res.status(400).json(error("Not authorized!.", res.statusCode));
    }
}

//get current user
function getCurrentUser(req, res, next) {
    const token = req.header(constants.TOKE_NAME);

    if (token) {
        try {
            const validToken = auth.generateUser(token);
            req.user = validToken;
            if (validToken) {
                return next();
            } else {
                res.status(200).json(
                    success("OK", { user: null }, res.statusCode)
                );
            }
        } catch (err) {
            res.status(200).json(success("OK", { user: null }, res.statusCode));
        }
    } else {
        res.status(200).json(success("OK", { user: null }, res.statusCode));
    }
}

module.exports = {
    checkAuthAdmin: checkAuthAdmin,
    checkAuthUser: checkAuthUser,
    checkAuthAnyUser: checkAuthAnyUser,
    getCurrentUser: getCurrentUser,
};
