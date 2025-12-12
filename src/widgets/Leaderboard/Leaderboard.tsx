import React, { useEffect, useState } from "react";

const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/";

export interface User {
    id: string;
    username: string;
    wins: number;
}


const Leaderboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/leaderboard`);
                if (!response.ok) throw new Error("Failed to fetch leaderboard");
                const data: User[] = await response.json();
                setUsers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, []);

    if (loading) return <p>Loading leaderboard...</p>;

    return (
        <table>
            <thead>
            <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Wins</th>
            </tr>
            </thead>
            <tbody>
            {users.map((u, i) => (
                <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td>{u.username}</td>
                    <td>{u.wins}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default Leaderboard;
