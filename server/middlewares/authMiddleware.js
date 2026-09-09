const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        console.log("AUTH HEADER:", req.headers.authorization);

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).send({
                message: "Authorization header is missing",
                success: false,
            });
        }

        const token = authHeader.split(" ")[1];

        console.log("TOKEN RECEIVED:", token ? "YES" : "NO");

        const decodedToken = jwt.verify(
            token,
            process.env.SECRET_KEY
        );

        console.log("DECODED TOKEN:", decodedToken);

        req.userId = decodedToken.userId;

        next();

    } catch (error) {
        console.log("AUTH ERROR:", error.message);

        return res.status(401).send({
            message: error.message,
            success: false,
        });
    }
};