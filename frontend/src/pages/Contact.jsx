import "../styles/contact.css";
import { Mail, Send } from "lucide-react";
import { useState } from "react";

function Contact() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setForm({
            name: "",
            email: "",
            subject: "",
            message: "",
        });
    };

    return (
        <div className="contact-page">
            <div className="contact-card">

                <div className="contact-title">
                    <Mail size={32} />
                    <div>
                        <h1>Contact Us</h1>
                        <p>
                            This form is a UI placeholder for the demo and does not send messages.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={handleChange}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={form.subject}
                        onChange={handleChange}
                    />

                    <textarea
                        rows="7"
                        name="message"
                        placeholder="Write your message..."
                        value={form.message}
                        onChange={handleChange}
                    />

                    <button type="submit">
                        <Send size={18} />
                        Send Message
                    </button>

                </form>

            </div>
        </div>
    );
}

export default Contact;