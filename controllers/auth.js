let jwt = require("jsonwebtoken");
let constants = require("../constants/envConstants");

//generate keys
function generateToken(user) {
    let payload = {
        id: user._id,
        email: user.email,
        password: user.password,
        email_verified: user.verified,
        role: user.role,
    };
    return jwt.sign(payload, constants.secret);
}

//checking whether the token provided by user is correct one
function checkToken(token, role) {
    const payload = jwt.verify(token, constants.secret);
    return { user: payload, state: payload.role === role };
}

function generateUser(token) {
    const payload = jwt.verify(token, constants.secret);
    return payload;
}

module.exports = { generateToken, checkToken, generateUser };

//When the user is logged in, a token has to be generated
//and then is has to be sent to the client.
