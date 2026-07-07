import Link from "next/link";
export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-slate-900 text-white p-6">
            <h1>Digital Visitor Log</h1>
            <p>MAIN MENU</p>

            <ul className="space-y-4 mt-8">

                <li><Link href="/dashboard">Dashboard</Link></li>

                <li><Link href="/dashboard/companies">Companies</Link></li>

                <li><Link href="/dashboard/staff">Staff</Link></li>

                <li><Link href="/dashboard/visitor">Visitors</Link></li>

                <li><Link href="/dashboard/report">Reports</Link></li>

                <li><Link href="/dashboard/settings">Settings</Link></li><br />

            </ul>


            <hr /><br />

            <p>Barbara Logah</p>
            <p>Administrator</p>
            <button>Logout</button>
        </div>
    );
}
