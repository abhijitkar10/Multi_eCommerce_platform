import { useState } from 'react';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false); // State to toggle chatbot visibility

    const sendMessage = async () => {
        // Function to send a message
    };

    return (
        <>
            <button
                className="chatbot-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                Chat
            </button>
            {isOpen && (
                <div className="chatbot">
                    {/* Chatbot content */}
                </div>
            )}
        </>
    );
}