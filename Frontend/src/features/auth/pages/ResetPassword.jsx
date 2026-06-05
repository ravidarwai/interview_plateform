import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { resetPassword } from '../services/auth.api'
import "../auth.form.scss"

const ResetPassword = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!token) {
            setError("Password reset token is missing. Please request a new password reset link.")
            return
        }

        if (!password) {
            setError("Please enter a new password.")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)
        setError("")
        setMessage("")

        try {
            const data = await resetPassword({ token, password })
            setMessage(data.message || "Your password has been reset successfully. You can now login.")
            setPassword("")
            setConfirmPassword("")
        } catch (err) {
            setError(err.message || "Failed to reset password. The link may have expired or is invalid.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Reset Password</h1>
                <p>Choose a new password for your account.</p>

                {!token && (
                    <div style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "rgba(225, 3, 77, 0.1)",
                        border: "1px solid #e1034d",
                        borderRadius: "0.5rem",
                        color: "#ff4d7d",
                        fontSize: "0.9rem",
                        textAlign: "center"
                    }}>
                        Invalid or missing token. Please return to the login page and request a new password reset link.
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "rgba(225, 3, 77, 0.1)",
                        border: "1px solid #e1034d",
                        borderRadius: "0.5rem",
                        color: "#ff4d7d",
                        fontSize: "0.9rem",
                        textAlign: "center"
                    }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "rgba(46, 160, 67, 0.1)",
                        border: "1px solid #2ea043",
                        borderRadius: "0.5rem",
                        color: "#56d364",
                        fontSize: "0.9rem",
                        textAlign: "center"
                    }}>
                        {message}
                    </div>
                )}

                {token && !message && (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter new password"
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                disabled={loading}
                                required
                            />
                        </div>

                        <button className="button primary-button" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <p>
                    Go back to <Link to="/login">Login</Link>
                </p>
            </div>
        </main>
    )
}

export default ResetPassword
