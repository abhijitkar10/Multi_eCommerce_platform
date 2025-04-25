import React, { useState } from "react";

function CreateAccount() {
    const [phoneNumber, setPhoneNumber] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const userData = {
            // other fields
            phoneNumber,
        };
        // handle user data submission
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* other fields */}
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
            />
            {/* other fields */}
        </form>
    );
}

export default CreateAccount;