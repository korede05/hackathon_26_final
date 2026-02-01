import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient'; // Ensure this path is correct

export const AnnouncementsPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-4xl font-bold">Announcements Page</h1>
        </div>
    );
}
