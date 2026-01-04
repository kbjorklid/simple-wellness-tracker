import React from 'react';

export default function Header({ onSettingsClick }) {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-border-dark px-6 lg:px-10 py-2 bg-white dark:bg-card-dark z-10 relative shadow-sm">
            <div className="flex items-center gap-3">
                <div className="size-7 text-primary">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor"></path>
                    </svg>
                </div>
                <h2 className="text-slate-900 dark:text-white text-base font-bold leading-tight tracking-tight">CalorieLog</h2>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onSettingsClick}
                    className="flex items-center justify-center rounded-lg size-8 bg-gray-100 dark:bg-input-bg-dark text-slate-700 dark:text-gray-300 hover:opacity-80 transition-opacity border border-transparent dark:border-border-dark"
                >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                </button>
                <div className="bg-center bg-no-repeat bg-cover rounded-full size-8 ring-2 ring-gray-100 dark:ring-border-dark" data-alt="User profile avatar placeholder" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBC5zoCqd3sby3_2B9o66aX9dkysj7QvA4Wg-ac9UCiKYnhpb_IrUsl38ye1QLew3yvzrBH9L8FmWxihmsSInvEkrBnfZQ15xVO_cARBaSBt0lvefj0mT9S9VXWWzUZ1fUvkI8Plt0CAkXtjmh3nd8f52-PEjewI364HpzgZ6dkcKf0U4m6ZQRIVR9TBofljZhdWAd57NbxPbmjhlaWlOpynANuN8676Mlpjo2SYKmbxGHGG3ldfMh1HtBFVzYi6nUnDJgn4dQaeqQ")' }}></div>
            </div>
        </header>
    );
}
