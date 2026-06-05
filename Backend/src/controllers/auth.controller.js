const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const emailService = require("../services/email.service")

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production"
    })


    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production"
    })
    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            token: token
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)



    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}

/**
 * @name forgotPasswordController
 * @description send reset password token to user email
 * @access Public
 */
async function forgotPasswordController(req, res) {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({
            message: "Please provide an email address."
        })
    }

    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({
                message: "No account found with this email address."
            })
        }

        // Generate short-lived token using JWT_SECRET + user.password
        // This ensures the token becomes invalid as soon as the password is changed.
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET + user.password,
            { expiresIn: "15m" }
        )

        // Build reset link. Frontend runs on localhost:5173 or customized domain.
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
        const resetLink = `${frontendUrl}/reset-password?token=${token}`

        // Send reset email
        await emailService.sendResetEmail(user.email, resetLink)

        res.status(200).json({
            message: "If an account exists with that email, a password reset link has been sent.",
            // In development, return the link directly for easier manual verification
            link: process.env.NODE_ENV !== "production" ? resetLink : undefined
        })
    } catch (err) {
        console.error("Forgot password error:", err)
        res.status(500).json({
            message: "An error occurred while processing your request. Please try again."
        })
    }
}

/**
 * @name resetPasswordController
 * @description resets user password using verified token
 * @access Public
 */
async function resetPasswordController(req, res) {
    const { token, password } = req.body

    if (!token || !password) {
        return res.status(400).json({
            message: "Please provide token and password"
        })
    }

    try {
        // Unsafely decode token to get the user ID
        const decoded = jwt.decode(token)
        if (!decoded || !decoded.id) {
            return res.status(400).json({
                message: "Invalid or expired token"
            })
        }

        // Find user
        const user = await userModel.findById(decoded.id)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        // Verify token signature with the user's password hash
        try {
            jwt.verify(token, process.env.JWT_SECRET + user.password)
        } catch (verifyErr) {
            return res.status(400).json({
                message: "Invalid or expired token"
            })
        }

        // Hash new password
        const hash = await bcrypt.hash(password, 10)
        user.password = hash
        await user.save()

        res.status(200).json({
            message: "Password reset successfully."
        })
    } catch (err) {
        console.error("Reset password error:", err)
        res.status(500).json({
            message: "An error occurred while resetting your password. Please try again."
        })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    forgotPasswordController,
    resetPasswordController
}
