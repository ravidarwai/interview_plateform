import React, { useState } from 'react'
import { Link } from 'react-router'
import { forgotPassword } from '../services/auth.api'
import "../auth.form.scss"

const ForgotPassword = () => {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [devLink, setDevLink] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) {
            setError("Please enter your email address.")
            return
        }

        setLoading(true)
        setError("")
        setMessage("")
        setDevLink("")

        try {
            const data = await forgotPassword({ email })
            setMessage(data.message || "A password reset link has been sent to your email.")
            if (data.link) {
                setDevLink(data.link)
            }
        } catch (err) {
            setError(err.message || "Failed to process request. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Forgot Password</h1>
                <p>Enter your email address to receive a password reset link.</p>

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

                {/* Developer Helper Box */}
                {devLink && (
                    <div style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "rgba(240, 139, 45, 0.1)",
                        border: "1px solid #f08b2d",
                        borderRadius: "0.5rem",
                        color: "#f08b2d",
                        fontSize: "0.85rem",
                        textAlign: "left",
                        wordBreak: "break-all"
                    }}>
                        <strong>Dev Helper Link:</strong><br />
                        <a href={devLink} style={{ color: "#f08b2d", textDecoration: "underline" }}>
                            {devLink}
                        </a>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email address"
                            disabled={loading}
                            required
                        />
                    </div>

                    <button className="button primary-button" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <p>
                    Remember your password? <Link to="/login">Login</Link>
                </p>
            </div>
        </main>
    )
}

export default ForgotPassword
