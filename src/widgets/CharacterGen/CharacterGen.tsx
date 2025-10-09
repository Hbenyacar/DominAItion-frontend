import React, { useState } from 'react';

const CharacterGen = () => {
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setDescription(event.target.value);
        setMessage('');
    };

    const handleSubmit = async () => {
        if (!description.trim()) {
            setMessage('Description cannot be empty.');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            const response = await fetch('/api/ai/character', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit description.');
            }

            setMessage('Description submitted successfully!');
            setDescription('');
        } catch (error) {
            // @ts-ignore
            setMessage(error.message || 'An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '1rem auto' }}>
            <h3> Character Description</h3>
            <textarea
                value={description}
                onChange={handleChange}
                placeholder="Enter your description..."
                style={{alignItems: "center", width: '100%', padding: '8px', boxSizing: 'border-box' }}></textarea>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{ marginTop: '0.5rem' }}
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>

            {message && (
                <div
                    style={{
                        marginTop: '0.5rem',
                        color: message.includes('successfully') ? 'green' : 'red',
                    }}
                >
                    {message}
                </div>
            )}
        </div>
    );
};

export default CharacterGen;
