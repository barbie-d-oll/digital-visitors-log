import { Bell, Search } from "lucide-react";

export default function Header() {
    return (
        <header className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm">

            {/* Left Side */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800">
                    Dashboard
                </h1>

            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">

                {/* Search Box */}
                <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
                    <Search size={18} className="text-gray-500" />

                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent outline-none ml-2"
                    />
                </div>

                {/* Notification */}
                <button className="bg-gray-100 p-3 rounded-lg">
                    <Bell size={20} />
                </button>

                {/* User */}
                <div className="text-right">
                    <h3 className="font-semibold">
                        Barbara Logah
                    </h3>

                    <p className="text-sm text-gray-500">
                        Company Administrator
                    </p>
                </div>

            </div>

        </header>
    );
}